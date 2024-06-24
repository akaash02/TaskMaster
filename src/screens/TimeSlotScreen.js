import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';
import AddTimeSlotScreen from './AddTimeSlotScreen';

const TimeSlotScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const { theme } = useContext(ThemeContext);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timeSlots, setTimeSlots] = useState([]);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Custom'];

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDay]);

  const fetchTimeSlots = async () => {
    if (!userId) return;
    const slotsCollectionRef = collection(firestore, 'users', userId, 'freeTimeSlots');
    const q = selectedDay === 'Custom'
      ? query(slotsCollectionRef, where('isCustom', '==', true))
      : query(slotsCollectionRef, where('dayOfWeek', '==', selectedDay));

    const querySnapshot = await getDocs(q);
    const fetchedSlots = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setTimeSlots(fetchedSlots);
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteDoc(doc(firestore, 'users', userId, 'freeTimeSlots', slotId));
      fetchTimeSlots();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete time slot');
    }
  };

  const navigateToAddTimeSlot = () => {
    navigation.navigate('AddTimeSlot');
  };

  return (
    
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.card }]}
        onPress={navigateToAddTimeSlot}
      >
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Add Time Slot</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.text }]}>View Time Slots</Text>
      <ScrollView horizontal style={styles.daySelector}>
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayButtonText, selectedDay === day && { color: theme.colors.background }]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.timeSlotList}>
        {timeSlots.map(slot => (
          <View key={slot.id} style={styles.timeSlot}>
            <Text style={[styles.slotText, { color: theme.colors.text }]}>
              {slot.start.toDate().toLocaleString()} - {slot.end.toDate().toLocaleString()}
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
              onPress={() => handleDeleteSlot(slot.id)}
            >
              <Text style={[styles.buttonText, { color: theme.colors.background }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: "5%",
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
  title: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 20,
  },
  daySelector: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dayButton: {
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  dayButtonText: {
    fontWeight: 'bold',
  },
  timeSlotList: {
    marginTop: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  slotText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
  },
});

export default TimeSlotScreen;
