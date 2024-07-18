import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header, Card } from 'react-native-elements';
import { createModel, trainModel, predictSingle } from '../../tensorflowModel';
import { prepareData } from '../../prepareData';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { firestore, auth } from '../config/firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes/ThemeIndex';
import NavBar from '../components/NavBar';

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
        centerComponent={{ text: 'Sleep', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]} onPress={() => navigation.navigate('AddSleep')}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Add sleep data</Text>
      </TouchableOpacity>

      {/* Saved Optimal Sleep Schedule Card */}
      <Card containerStyle={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}>Saved Optimal Sleep Schedule</Card.Title>
        {savedSchedule ? (
          <>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Start Time: {savedSchedule.startTime}:00
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              End Time: {savedSchedule.endTime}:00
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Hours Slept: {savedSchedule.hoursSlept}
            </Text>
          </>
        ) : (
          <Text style={[styles.cardText, { color: theme.colors.text }]}>No saved schedule found.</Text>
        )}
      </Card>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]} onPress={setupModel}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Generate Model</Text>
      </TouchableOpacity>
      <Card containerStyle={[styles.cardContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Card.Title style={[styles.cardTitle, { color: theme.colors.text }]}>Currently Generated Optimal Schedule</Card.Title>
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
          <>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Start Time: {optimalSchedule.startTime}:00
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              End Time: {optimalSchedule.endTime}:00
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>
              Hours Slept: {optimalSchedule.hoursSlept}
            </Text>
          </>
        ) : (
          <Text style={[styles.cardText, { color: theme.colors.text }]}>Generate the model to calculate optimal schedule...</Text>
        )}
      </Card>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card, marginBottom: "33%" }]} onPress={saveSchedule}>
        <Text style={[styles.buttonText, { color: theme.colors.text }]}>Save Optimal Schedule</Text>
      </TouchableOpacity>
      <NavBar navigation={navigation} userId={auth.currentUser.uid} scheduleId={'yourScheduleId'} />
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
    fontSize: 45,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    width: "90%",
    marginLeft: 17,
    borderWidth: 1.5,

  },
  buttonText: {
    fontSize: 18,
  },
  cardContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
    marginLeft: 17,
    borderWidth: 1.5,
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
  },
});

export default SleepScreen;
