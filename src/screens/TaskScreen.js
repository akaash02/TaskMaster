import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Icon, Card } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const TaskScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const scheduleId = route?.params?.scheduleId;
  
  if (!userId || !scheduleId) {
    console.error('userId or scheduleId is undefined');
    navigation.navigate('Home');
    return null;
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const handleSave = async () => {
    try {
      const taskData = {
        title,
        description,
        dueDate,
        priority,
        repeat,
        repeatInterval,
      };

      const tasksCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
      await addDoc(tasksCollectionRef, taskData);

      console.log('Task saved:', taskData);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving task:', error);
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
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={showDatePicker}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Due Date: {dueDate ? dueDate.toLocaleDateString() : 'Select Due Date'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <TextInput
            style={styles.input}
            placeholder="Priority"
            value={String(priority)}
            onChangeText={(value) => setPriority(Number(value))}
            keyboardType="numeric"
          />
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
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
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

export default TaskScreen;