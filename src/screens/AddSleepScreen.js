import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { firestore, auth } from '../config/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const AddSleepScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [quality, setQuality] = useState('');
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const handleSaveSleep = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const sleepData = {
          startTime: Timestamp.fromDate(startTime),
          endTime: Timestamp.fromDate(endTime),
          quality: parseInt(quality),
        };

        await addDoc(collection(firestore, 'users', user.uid, 'sleepData'), sleepData);
        Alert.alert('Success', 'Sleep data added successfully.');
        navigation.goBack();
      } catch (error) {
        console.error('Error adding sleep data: ', error);
        Alert.alert('Error', 'Failed to add sleep data. Please try again.');
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleStartTimeConfirm = (selectedTime) => {
    setStartTime(selectedTime);
    setStartTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (selectedTime) => {
    setEndTime(selectedTime);
    setEndTimePickerVisibility(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Start Time:</Text>
      <TouchableOpacity onPress={() => setStartTimePickerVisibility(true)}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {startTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="datetime"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setStartTimePickerVisibility(false)}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>End Time:</Text>
      <TouchableOpacity onPress={() => setEndTimePickerVisibility(true)}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {endTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="datetime"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setEndTimePickerVisibility(false)}
      />

      <Text style={[styles.label, { color: theme.colors.text }]}>Quality (1-10):</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        keyboardType="numeric"
        value={quality}
        onChangeText={setQuality}
      />

      <Button title="Save Sleep Data" onPress={handleSaveSleep} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default AddSleepScreen;
