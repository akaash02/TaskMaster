import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Header } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';
import NavBar from '../components/NavBar';
import { initTensorFlow, createModel, trainModel, predictQuality } from '../../tensorflowSetup';

const sampleSleepData = [
  { startTime: new Date('2023-07-01T22:00:00').getTime(), endTime: new Date('2023-07-02T06:00:00').getTime(), hoursSlept: 8, quality: 7 },
  { startTime: new Date('2023-07-02T23:00:00').getTime(), endTime: new Date('2023-07-03T07:00:00').getTime(), hoursSlept: 8, quality: 8 },
  { startTime: new Date('2023-07-03T21:30:00').getTime(), endTime: new Date('2023-07-04T05:30:00').getTime(), hoursSlept: 8, quality: 6 },
  { startTime: new Date('2023-07-04T22:30:00').getTime(), endTime: new Date('2023-07-05T06:30:00').getTime(), hoursSlept: 8, quality: 7 },
  { startTime: new Date('2023-07-05T23:00:00').getTime(), endTime: new Date('2023-07-06T07:00:00').getTime(), hoursSlept: 8, quality: 8 },
  { startTime: new Date('2023-07-06T22:00:00').getTime(), endTime: new Date('2023-07-07T06:00:00').getTime(), hoursSlept: 8, quality: 9 },
  { startTime: new Date('2023-07-07T21:00:00').getTime(), endTime: new Date('2023-07-08T05:00:00').getTime(), hoursSlept: 8, quality: 5 },
];

const SleepScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initTensorFlow();
        console.log("TensorFlow initialized");
  
        const data = sampleSleepData;
  
        console.log("Creating model...");
        const model = createModel();
        console.log("Model created");
  
        await trainModel(model, data);
        console.log("Model trained");
  
        const preds = predictQuality(model, data);
        console.log("Predictions made");
        setPredictions(preds);
      } catch (error) {
        console.error('Error processing sleep data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, []);
  

  if (loading) {
    return <ActivityIndicator size="large" color={theme.colors.primary} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        centerComponent={{ text: 'Sleep Tracker', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <View style={styles.content}>
        {predictions.length > 0 ? (
          predictions.map((pred, index) => (
            <Text key={index} style={[styles.predictionText, { color: theme.colors.text }]}>
              Predicted Quality: {pred.toFixed(2)}
            </Text>
          ))
        ) : (
          <Text style={[styles.noDataText, { color: theme.colors.text }]}>No sleep data available</Text>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('AddSleep')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Add Sleep Data</Text>
        </TouchableOpacity>
      </View>
      <NavBar navigation={navigation} userId={'yourUserId'} scheduleId={'yourScheduleId'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 18,
    marginBottom: 20,
  },
  predictionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SleepScreen;