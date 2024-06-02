// /src/screens/EventScreen.js

import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { Text } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions } from '@react-navigation/native';
import { ThemeContext } from '../themses/ThemeContext';

const EventScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const scheduleId = route?.params?.scheduleId;
  const { theme } = useContext(ThemeContext);

  if (!userId || !scheduleId) {
    console.error('userId or scheduleId is undefined');
    navigation.navigate('Home');
    return null;
  }

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDraftEvent = async () => {
      try {
        const draftEvent = await AsyncStorage.getItem(`draftEvent-${userId}-${scheduleId}`);
        if (draftEvent) {
          const parsedEvent = JSON.parse(draftEvent);
          setTitle(parsedEvent.title);
          setLocation(parsedEvent.location);
          setStartTime(new Date(parsedEvent.startTime));
          setEndTime(new Date(parsedEvent.endTime));
          setAllDay(parsedEvent.allDay);
          setRepeat(parsedEvent.repeat);
          setRepeatInterval(parsedEvent.repeatInterval);
        }
      } catch (error) {
        console.error('Error loading draft event:', error);
      }
    };
    loadDraftEvent();
  }, [userId, scheduleId]);

  const saveDraftEvent = async () => {
    const eventData = {
      title,
      location,
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
      allDay,
      repeat,
      repeatInterval,
    };
    try {
      await AsyncStorage.setItem(`draftEvent-${userId}-${scheduleId}`, JSON.stringify(eventData));
      console.log('Draft event saved:', eventData);
      Alert.alert('Draft Saved', 'Draft event has been saved locally.');
      navigation.dispatch(CommonActions.navigate('Home'));
    } catch (error) {
      console.error('Error saving draft event:', error);
      Alert.alert('Error', 'Error saving draft event.');
    }
  };

  useEffect(() => {
    const syncEvents = async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const drafts = await AsyncStorage.getAllKeys();
        const eventKeys = drafts.filter(key => key.startsWith(`draftEvent-${userId}-${scheduleId}`));
        for (const key of eventKeys) {
          const draftEvent = JSON.parse(await AsyncStorage.getItem(key));
          const eventsCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');
          await addDoc(eventsCollectionRef, draftEvent);
          await AsyncStorage.removeItem(key);
        }
      }
    };
    syncEvents();
  }, [userId, scheduleId]);

  const handleSave = async () => {
    console.log('handleSave triggered');
    Alert.alert('Debug', 'handleSave triggered');
    try {
      setLoading(true);
      const eventData = {
        title,
        location,
        startTime,
        endTime,
        allDay,
        repeat,
        repeatInterval,
      };

      const netInfo = await NetInfo.fetch();
      console.log('Network info:', netInfo);
      Alert.alert('Network info', JSON.stringify(netInfo));

      if (netInfo.isConnected) {
        const eventsCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');
        await addDoc(eventsCollectionRef, eventData);
        console.log('Event saved to firestore:', eventData);
        navigation.navigate('Home');
      } else {
        console.log('Saving event offline:', eventData);
        await saveDraftEvent();
        Alert.alert('No Internet', 'Event saved locally. It will be synced when you are online.');
        console.log('Event saved locally:', eventData);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimeConfirm = (date) => {
    setStartTime(date);
    setStartTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (date) => {
    setEndTime(date);
    setEndTimePickerVisibility(false);
  };

  const toggleAllDay = () => {
    setAllDay(previousState => !previousState);
    if (!allDay) {
      const now = new Date();
      setStartTime(new Date(now.setHours(0, 0, 0, 0)));
      setEndTime(new Date(now.setHours(23, 59, 59, 999)));
    } else {
      setStartTime(null);
      setEndTime(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.title, { color: theme.colors.text }]}>Create Event</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Title"
        placeholderTextColor={theme.colors.placeholder}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Location"
        placeholderTextColor={theme.colors.placeholder}
        value={location}
        onChangeText={setLocation}
      />
      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>All Day</Text>
        <Switch
          value={allDay}
          onValueChange={toggleAllDay}
        />
      </View>
      {!allDay && (
        <>
          <TouchableOpacity onPress={() => setStartTimePickerVisibility(true)}>
            <Text style={[styles.input, { color: theme.colors.text }]}>
              {startTime ? startTime.toLocaleString() : 'Start Time'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEndTimePickerVisibility(true)}>
            <Text style={[styles.input, { color: theme.colors.text }]}>
              {endTime ? endTime.toLocaleString() : 'End Time'}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="datetime"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartTimePickerVisibility(false)}
          />
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="datetime"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndTimePickerVisibility(false)}
          />
        </>
      )}
      <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Save Event</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Home</Text>
      </TouchableOpacity>
      <Text style={[styles.offlineText, { color: theme.colors.text }]}>If offline just click save once and press home</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
    
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 8,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    marginRight: 8,
  },
  offlineText: {
    textAlign: 'center',
  },
});

export default EventScreen;
