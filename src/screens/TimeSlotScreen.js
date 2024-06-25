import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../config/firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../navigation/AppNavigator';

const TimeSlotScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  

  useEffect(() => {
    const fetchUserId = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserId(currentUser.uid);
      }
    };
    fetchUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchTimeSlots = async () => {
        if (!userId) return;
        try {
          const slotsCollectionRef = collection(firestore, 'users', userId, 'freeTimeSlots');
          const querySnapshot = await getDocs(slotsCollectionRef);
          const slotsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTimeSlots(slotsList);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching time slots:', error);
          setLoading(false);
        }
      };

      fetchTimeSlots();
    }, [userId])
  );

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${adjustedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.headerText, { color: theme.colors.text }]}>Weekly Time Slots</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
        ) : (
          timeSlots.map((slot) => (
            <View key={slot.id} style={[styles.timeSlotCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.timeSlotText, { color: theme.colors.text }]}>
                {slot.dayOfWeek}: {formatMinutes(slot.startTime)} - {formatMinutes(slot.endTime)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('AddTimeSlot')}>
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  timeSlotCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  timeSlotText: {
    fontSize: 16,
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default TimeSlotScreen;
