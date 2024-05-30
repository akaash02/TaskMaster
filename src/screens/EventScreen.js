import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Icon, Card } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const EventScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const scheduleId = route?.params?.scheduleId;

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
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleConfirmStartTime = (date) => {
    setStartTime(date);
    hideStartTimePicker();
  };

  const handleConfirmEndTime = (date) => {
    setEndTime(date);
    hideEndTimePicker();
  };

  const handleSave = async () => {
    try {
      const eventData = {
        title,
        location,
        startTime,
        endTime,
        allDay,
        repeat,
        repeatInterval,
      };

      const eventsCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');
      await addDoc(eventsCollectionRef, eventData);

      console.log('Event saved:', eventData);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={showStartTimePicker}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Start Time: {startTime ? startTime.toLocaleString() : 'Select Start Time'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={showEndTimePicker}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>End Time: {endTime ? endTime.toLocaleString() : 'Select End Time'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => setAllDay(!allDay)}>
              <View style={styles.cardContent}>
                <Icon name="all-inclusive" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>All Day: {allDay ? 'Yes' : 'No'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => setRepeat(!repeat)}>
              <View style={styles.cardContent}>
                <Icon name="repeat" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Repeat: {repeat ? 'Yes' : 'No'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          {repeat && (
            <TextInput
              style={styles.input}
              placeholder="Repeat Interval (days)"
              value={String(repeatInterval)}
              onChangeText={(value) => setRepeatInterval(Number(value))}
              keyboardType="numeric"
            />
          )}
          <Card containerStyle={[styles.card, styles.saveCard]}>
            <TouchableOpacity onPress={handleSave}>
              <View style={styles.cardContent}>
                <Icon name="save" type="material" size={27} color="#FFFFFF" />
                <Text style={styles.saveCardTitle}>Save</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        <DateTimePickerModal
          isVisible={isStartTimePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmStartTime}
          onCancel={hideStartTimePicker}
        />
        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="datetime"
          onConfirm={handleConfirmEndTime}
          onCancel={hideEndTimePicker}
        />
      </View>
      <View style={styles.bottomNav}>
        <Icon
          name="home"
          type="material"
          onPress={() => navigation.navigate('Home')}
          size={30}
          color="#03012E"
        />
        <Icon
          name="calendar-today"
          type="material"
          onPress={() => navigation.navigate('Calendar', { userId: 'yourUserId', scheduleId: 'yourScheduleId' })}
          size={30}
          color="#03012E"
        />
        <Icon
          name="people"
          type="material"
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color="#03012E"
        />
        <Icon
          name="person"
          type="material"
          onPress={() => navigation.navigate('Profile')}
          size={30}
          color="#03012E"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#03012E',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  card: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveCard: {
    backgroundColor: '#6aa8f2',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    color: '#03012E',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  saveCardTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
});

export default EventScreen;
