import React, { useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, TimePickerAndroid, DatePickerIOS } from 'react-native';
import { ThemeContext } from '../navigation/AppNavigator'; 
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AddTimeSlotScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const showTimePicker = async (isStartTime) => {
    if (Platform.OS === 'android') {
      try {
        const { action, hour, minute } = await TimePickerAndroid.open({
          hour: 0,
          minute: 0,
          is24Hour: true,
        });
        if (action !== TimePickerAndroid.dismissedAction) {
          const time = hour * 60 + minute;
          isStartTime ? setStartTime(time) : setEndTime(time);
        }
      } catch ({ code, message }) {
        console.warn('Cannot open time picker', message);
      }
    }
  };

  const handleAddWeeklyTimeSlot = async () => {
    if (!startTime || !endTime || startTime >= endTime) {
      Alert.alert('Invalid Time Slot', 'Please ensure the start time is before the end time.');
      return;
    }

    const q = query(
      collection(firestore, 'timeslots'),
      where('day', '==', day)
    );
    const querySnapshot = await getDocs(q);
    const overlapping = querySnapshot.docs.some(doc => {
      const ts = doc.data();
      return (startTime < ts.endTime && endTime > ts.startTime);
    });

    if (overlapping) {
      Alert.alert('Conflict Detected', 'This timeslot overlaps with an existing one.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'timeslots'), {
        day,
        startTime,
        endTime
      });
      Alert.alert('Success', 'Time slot added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to add time slot');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button title="Back" onPress={() => navigation.goBack()} />
      <Text style={{ color: theme.colors.text }}>Add Weekly Time Slot</Text>
      <Picker
        selectedValue={day}
        onValueChange={(itemValue) => setDay(itemValue)}
        style={{ height: 50, width: 150, color: theme.colors.text }}
      >
        <Picker.Item label="Monday" value="Monday" />
        <Picker.Item label="Tuesday" value="Tuesday" />
        <Picker.Item label="Wednesday" value="Wednesday" />
        <Picker.Item label="Thursday" value="Thursday" />
        <Picker.Item label="Friday" value="Friday" />
        <Picker.Item label="Saturday" value="Saturday" />
        <Picker.Item label="Sunday" value="Sunday" />
      </Picker>
      <Button title="Select Start Time" onPress={() => showTimePicker(true)} />
      <Button title="Select End Time" onPress={() => showTimePicker(false)} />
      <Button title="Add Time Slot" onPress={handleAddWeeklyTimeSlot} />

      {Platform.OS === 'ios' && (
        <DatePickerIOS
          mode="time"
          date={new Date()}
          onDateChange={(time) => setStartTime(time.getHours() * 60 + time.getMinutes())}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: "7%" },
});

export default AddTimeSlotScreen;
