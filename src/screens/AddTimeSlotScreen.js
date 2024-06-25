import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../navigation/AppNavigator'; 
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../config/firebaseConfig'; // Import Firebase Auth to get the current user

const AddTimeSlotScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const [userId, setUserId] = useState(route.params?.userId);
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (!userId) {
      fetchUserId();
    }
  }, []);

  const fetchUserId = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserId(currentUser.uid);
        } else {
          Alert.alert('Error', 'User not found in Firestore.');
        }
      } else {
        Alert.alert('Error', 'No user is currently signed in.');
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      Alert.alert('Error', 'Failed to fetch user ID.');
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setStartTime(selectedTime);
    }
    setShowStartTimePicker(false);
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setEndTime(selectedTime);
    }
    setShowEndTimePicker(false);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${adjustedHours}:${formattedMinutes} ${ampm}`;
  };

  const handleAddWeeklyTimeSlot = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User ID is not available.');
        return;
      }

      if (!startTime || !endTime) {
        Alert.alert('Invalid Time Slot', 'Please select both start and end times.');
        return;
      }

      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      if (startMinutes >= endMinutes) {
        Alert.alert('Invalid Time Slot', 'Please ensure the start time is before the end time.');
        return;
      }

      const slotsCollectionRef = collection(firestore, 'users', userId, 'freeTimeSlots');
      const q = query(slotsCollectionRef, where('dayOfWeek', '==', day));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const overlapping = querySnapshot.docs.some(doc => {
          const ts = doc.data();
          return (startMinutes < ts.endTime && endMinutes > ts.startTime);
        });

        if (overlapping) {
          Alert.alert('Time Slot Conflict', 'The selected time slot overlaps with an existing one.');
          return;
        }
      }

      await addDoc(slotsCollectionRef, {
        dayOfWeek: day,
        startTime: startMinutes,
        endTime: endMinutes,
        isCustom: false
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error adding time slot:', error);
      Alert.alert('Error', 'Failed to add time slot.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Select Day of Week</Text>
      <Picker
        selectedValue={day}
        onValueChange={(itemValue) => setDay(itemValue)}
        style={styles.picker}
      >
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
          <Picker.Item key={day} label={day} value={day} />
        ))}
      </Picker>
      <Text style={[styles.label, { color: theme.colors.text }]}>Select Start Time</Text>
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.timePicker}>
        <Text style={styles.timeText}>{formatTime(startTime) || 'Select Time'}</Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleStartTimeChange}
        />
      )}
      <Text style={[styles.label, { color: theme.colors.text }]}>Select End Time</Text>
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePicker}>
        <Text style={styles.timeText}>{formatTime(endTime) || 'Select Time'}</Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddWeeklyTimeSlot}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Add Time Slot</Text>
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
  picker: {
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

export default AddTimeSlotScreen;
