import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes/ThemeIndex';

const CustomButton = ({ title, onPress, color, textColor }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

const ViewEventScreen = ({ navigation, route }) => {
  const { theme } = useContext(ThemeContext);
  const { userId, scheduleId, eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const cachedEvent = await AsyncStorage.getItem(`event_${eventId}`);
        if (cachedEvent) {
          setEvent(JSON.parse(cachedEvent));
          setLoading(false);
        }

        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          const eventDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'events', eventId));
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent(eventData);
            await AsyncStorage.setItem(`event_${eventId}`, JSON.stringify(eventData));
          } else if (!cachedEvent) {
            Alert.alert('Error', 'Event not found and no cached data available.');
          }
        } else if (!cachedEvent) {
          Alert.alert('Error', 'No internet connection and no cached data available.');
        }
      } catch (error) {
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{event.title}</Text>
      </View>
      <Text style={[styles.header, { color: theme.colors.text }]}>Location</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{event.location}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Start Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatDateTime(event.startTime)}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>End Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatDateTime(event.endTime)}</Text>
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Delete Event" onPress={deleteEvent} color="red" textColor="white" />
        <CustomButton title="Home" onPress={() => navigation.navigate('Home')} color={theme.colors.text} textColor={theme.colors.background} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 10,
  },
  titleContainer: {
    paddingTop: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 20,
    textAlign: 'left',
  },
  card: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    alignItems: 'left',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttons: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 8,
    width: "90%",
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default ViewEventScreen;
