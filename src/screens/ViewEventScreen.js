import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CustomButton = ({ title, onPress, color }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const ViewEventScreen = ({ navigation, route }) => {
  const { userId, scheduleId, eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event from AsyncStorage
        console.log('Fetching event from AsyncStorage');
        const cachedEvent = await AsyncStorage.getItem(`event_${eventId}`);
        if (cachedEvent) {
          console.log('Cached event found');
          setEvent(JSON.parse(cachedEvent));
          setLoading(false); // Stop loading spinner when cached data is found
        } else {
          console.log('No cached event found');
        }

        // Check network status and fetch from Firestore if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          console.log('Fetching event from Firestore');
          const eventDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'events', eventId));
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent(eventData);
            await AsyncStorage.setItem(`event_${eventId}`, JSON.stringify(eventData));
          } else {
            console.log('No such document!');
            if (!cachedEvent) {
              Alert.alert('Error', 'Event not found and no cached data available.');
            }
          }
        } else if (!cachedEvent) {
          Alert.alert('Error', 'No internet connection and no cached data available.');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Error fetching event data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [userId, scheduleId, eventId]);

  const deleteEvent = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await deleteDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'events', eventId));
      }
      await AsyncStorage.removeItem(`event_${eventId}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Error deleting event. Please try again.');
    }
  };

  const formatDateTime = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    return 'No Date';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{event.title}</Text>
      </View>
      <Text style={styles.header}>Location</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{event.location}</Text>
      </Card>
      <Text style={styles.header}>Start Time</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>
          {formatDateTime(event.startTime)}
        </Text>
      </Card>
      <Text style={styles.header}>End Time</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>
          {formatDateTime(event.endTime)}
        </Text>
      </Card>
      <Text style={styles.header}>All Day</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{event.allDay ? 'Yes' : 'No'}</Text>
      </Card>
      <Text style={styles.header}>Repeat</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{event.repeat ? `Every ${event.repeatInterval} days` : 'No'}</Text>
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Edit Event" onPress={() => navigation.navigate('Event', { userId, scheduleId, eventId })} color="#3498db" />
        <CustomButton title="Back" onPress={() => navigation.navigate('Calendar', { userId, scheduleId })} color="#3498db" />
        <CustomButton title="Delete Event" onPress={deleteEvent} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03012E',
    paddingTop: 50,
    paddingLeft: 10,
  },
  titleContainer: {
    paddingTop: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  title: {
    color: '#fff',
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  header: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'left',
  },
  card: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    alignItems: 'left',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#03012E',
  },
  buttons: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ViewEventScreen;
