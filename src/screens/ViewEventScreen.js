import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';

const CustomButton = ({ title, onPress, color }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const ViewEventScreen = ({ navigation, route }) => {
  const { userId, scheduleId, eventId } = route.params;
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'events', eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [userId, scheduleId, eventId]);

  const deleteEvent = async () => {
    try {
      await deleteDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'events', eventId));
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
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
          {event.startTime ? event.startTime.toDate().toLocaleString() : 'No Start Time'}
        </Text>
      </Card>
      <Text style={styles.header}>End Time</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>
          {event.endTime ? event.endTime.toDate().toLocaleString() : 'No End Time'}
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
