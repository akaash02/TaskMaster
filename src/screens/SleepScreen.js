import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header } from 'react-native-elements';
import { createModel, trainModel, predictSingle } from '../../tensorflowModel';
import { prepareData } from '../../prepareData';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { firestore, auth } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ThemeContext } from 'react-native-elements';

const SleepScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [model, setModel] = useState(null);
  const [optimalSchedule, setOptimalSchedule] = useState(null);
  const [savedSchedule, setSavedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sleepData, setSleepData] = useState([]);

  const retrieveSleepData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const sleepCollection = collection(firestore, 'users', user.uid, 'sleepData');
        const sleepSnapshot = await getDocs(sleepCollection);
        const sleepDataList = sleepSnapshot.docs.map(doc => {
          const data = doc.data();
          const startTime = data.startTime.toDate();
          const endTime = data.endTime.toDate();
          const hoursSlept = (endTime - startTime) / (1000 * 60 * 60);

          return {
            startTime: startTime.getHours(),
            endTime: endTime.getHours(),
            hoursSlept: hoursSlept,
            sleepQuality: data.quality,
          };
        });

        console.log('Retrieved sleep data:', sleepDataList);

        // Filter out any invalid data points
        const validSleepDataList = sleepDataList.filter(data =>
          data.hoursSlept > 0 && !isNaN(data.sleepQuality)
        );

        setSleepData(validSleepDataList);

        // Check if there are at least 7 valid data points
        if (validSleepDataList.length < 7) {
          setError('Insufficient data to make predictions. Please add more sleep data.');
          setLoading(false);
          return;
        }
      } else {
        setError('No user is currently signed in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const retrieveSavedSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.optimalSleepSchedule) {
            setSavedSchedule(data.optimalSleepSchedule);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const setupModel = async () => {
    try {
      setLoading(true);
      await tf.ready();
      const newModel = createModel();
      setModel(newModel);

      const { inputTensor, labelTensor } = prepareData(sleepData);
      console.log('Input Tensor:', inputTensor.arraySync());
      console.log('Label Tensor:', labelTensor.arraySync());

      await trainModel(newModel, inputTensor, labelTensor);

      inputTensor.dispose();
      labelTensor.dispose();

      const optimal = findOptimalSchedule(newModel);
      setOptimalSchedule(optimal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const findOptimalSchedule = (model) => {
    let bestQuality = -Infinity;
    let bestSchedule = null;

    for (let startTime = 20; startTime <= 23; startTime++) {
      for (let hoursSlept = 7; hoursSlept <= 10; hoursSlept++) { // Constrain hoursSlept
        const endTime = (startTime + hoursSlept) % 24;
        const input = [
          startTime / 23,
          endTime / 23,
          hoursSlept / 10, // Adjust normalization
          1 // Assume initial sleep quality is normalized
        ];

        const predictedQuality = predictSingle(model, input)[0];

        if (predictedQuality > bestQuality) {
          bestQuality = predictedQuality;
          bestSchedule = { startTime, endTime, hoursSlept, predictedQuality };
        }
      }
    }

    return bestSchedule;
  };

  const saveSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (user && optimalSchedule) {
        const userDoc = doc(firestore, 'users', user.uid);
        await updateDoc(userDoc, {
          optimalSleepSchedule: optimalSchedule
        });
        alert('Optimal schedule saved successfully!');
      } else {
        setError('No optimal schedule to save.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    retrieveSleepData();
    retrieveSavedSchedule();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: () => navigation.navigate('Profile') }}
        centerComponent={{ text: 'Sleep Schedule', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('AddSleep')}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Add sleep data</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Saved Optimal Sleep Schedule</Text>
        {savedSchedule ? (
          <View style={styles.scheduleContainer}>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              Start Time: {savedSchedule.startTime}:00
            </Text>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              End Time: {savedSchedule.endTime}:00
            </Text>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              Hours Slept: {savedSchedule.hoursSlept}
            </Text>
          </View>
        ) : (
          <Text style={[styles.scheduleText, { color: theme.colors.text }]}>No saved schedule found.</Text>
        )}
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={setupModel}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Generate Model</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={saveSchedule}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Save Optimal Schedule</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Currently Generated Optimal Schedule</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text }}>Loading model...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {error}</Text>
          </View>
        ) : optimalSchedule ? (
          <View style={styles.scheduleContainer}>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              Start Time: {optimalSchedule.startTime}:00
            </Text>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              End Time: {optimalSchedule.endTime}:00
            </Text>
            <Text style={[styles.scheduleText, { color: theme.colors.text }]}>
              Hours Slept: {optimalSchedule.hoursSlept}
            </Text>
          </View>
        ) : (
          <Text style={[styles.scheduleText, { color: theme.colors.text }]}>Generate the model to calculate optimal schedule...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scheduleContainer: {
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: 18,
  },
});

export default SleepScreen;

