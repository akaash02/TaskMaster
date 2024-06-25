import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../navigation/AppNavigator'; 
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomTimeSlotScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const userId = route.params?.userId;
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartChange = (event, selectedTime) => {
    if (selectedTime) {
      setStart(selectedTime);
    }
    setShowStartPicker(false);
  };

  const handleEndChange = (event, selectedTime) => {
    if (selectedTime) {
      setEnd(selectedTime);
    }
    setShowEndPicker(false);
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return date.toLocaleString();
  };

  const handleAddCustomTimeSlot = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID is not available.');
        return;
      }

      if (!start || !end) {
        Alert.alert('Invalid Time Slot', 'Please select both start and end times.');
        return;
      }

      if (start >= end) {
        Alert.alert('Invalid Time Slot', 'Please ensure the start time is before the end time.');
        return;
      }

      const slotsCollectionRef = collection(firestore, 'users', userId, 'freeTimeSlots');
      const q = query(slotsCollectionRef, where('isCustom', '==', true));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const overlapping = querySnapshot.docs.some(doc => {
          const ts = doc.data();
          const tsStart = ts.start ? ts.start.toDate() : null;
          const tsEnd = ts.end ? ts.end.toDate() : null;
          return tsStart && tsEnd && (start < tsEnd && end > tsStart);
        });

        if (overlapping) {
          Alert.alert('Time Slot Conflict', 'The selected time slot overlaps with an existing one.');
          return;
        }
      }

      await addDoc(slotsCollectionRef, {
        start,
        end,
        isCustom: true
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error adding custom time slot:', error);
      Alert.alert('Error', 'Failed to add custom time slot.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Select Start Date and Time</Text>
      <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.timePicker}>
        <Text style={styles.timeText}>{formatDateTime(start) || 'Select Date and Time'}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={start || new Date()}
          mode="datetime"
          display="default"
          onChange={handleStartChange}
        />
      )}
      <Text style={[styles.label, { color: theme.colors.text }]}>Select End Date and Time</Text>
      <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.timePicker}>
        <Text style={styles.timeText}>{formatDateTime(end) || 'Select Date and Time'}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={end || new Date()}
          mode="datetime"
          display="default"
          onChange={handleEndChange}
        />
      )}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddCustomTimeSlot}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Add Custom Time Slot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  timePicker: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default CustomTimeSlotScreen;
