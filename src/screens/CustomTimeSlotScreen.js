import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';

const CustomTimeSlotScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const { theme } = useContext(ThemeContext);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);

  const handleConfirmStart = (date) => {
    setStartDate(date);
    setStartPickerVisibility(false);
  };

  const handleConfirmEnd = (date) => {
    setEndDate(date);
    setEndPickerVisibility(false);
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end times.');
      return;
    }
    if (startDate >= endDate) {
      Alert.alert('Error', 'Start time must be before end time.');
      return;
    }

    const slotsCollectionRef = collection(firestore, 'users', userId, 'freeTimeSlots');
    const overlappingQuery = query(slotsCollectionRef, 
      where('start', '<=', Timestamp.fromDate(endDate)),
      where('end', '>=', Timestamp.fromDate(startDate))
    );
    const querySnapshot = await getDocs(overlappingQuery);

    if (!querySnapshot.empty) {
      Alert.alert('Error', 'The selected time slot overlaps with an existing one.');
      return;
    }

    try {
      await addDoc(slotsCollectionRef, {
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
        isCustom: true
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save time slot');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => setStartPickerVisibility(true)} style={styles.pickerButton}>
        <Text style={[styles.pickerText, { color: theme.colors.text }]}>
          {startDate ? startDate.toLocaleString() : 'Select Start Time'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setEndPickerVisibility(true)} style={styles.pickerButton}>
        <Text style={[styles.pickerText, { color: theme.colors.text }]}>
          {endDate ? endDate.toLocaleString() : 'Select End Time'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.card }]} onPress={handleSave}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Save</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="datetime"
        onConfirm={handleConfirmStart}
        onCancel={() => setStartPickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="datetime"
        onConfirm={handleConfirmEnd}
        onCancel={() => setEndPickerVisibility(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  pickerButton: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 8,
  },
  pickerText: {
    fontWeight: 'bold',
  },
  saveButton: {
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
