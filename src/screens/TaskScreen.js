import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions } from '@react-navigation/native';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDraftTask = async () => {
      try {
        const draftTask = await AsyncStorage.getItem(`draftTask-${userId}-${scheduleId}`);
        if (draftTask) {
          const parsedTask = JSON.parse(draftTask);
          setTitle(parsedTask.title);
          setDescription(parsedTask.description);
          setDueDate(new Date(parsedTask.dueDate));
          setPriority(parsedTask.priority);
          setRepeat(parsedTask.repeat);
          setRepeatInterval(parsedTask.repeatInterval);
        }
      } catch (error) {
        console.error('Error loading draft task:', error);
      }
    };
    loadDraftTask();
  }, [userId, scheduleId]);

  const saveDraftTask = async () => {
    const taskData = {
      title,
      description,
      dueDate: dueDate?.toISOString(),
      priority,
      repeat,
      repeatInterval,
    };
    try {
      await AsyncStorage.setItem(`draftTask-${userId}-${scheduleId}`, JSON.stringify(taskData));
      console.log('Draft task saved:', taskData); // Debug log
      Alert.alert('Draft Saved', 'Draft task has been saved locally.');
    } catch (error) {
      console.error('Error saving draft task:', error);
      Alert.alert('Error', 'Error saving draft task.');
    }
  };

  useEffect(() => {
    const syncTasks = async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const drafts = await AsyncStorage.getAllKeys();
        const taskKeys = drafts.filter(key => key.startsWith(`draftTask-${userId}-${scheduleId}`));
        for (const key of taskKeys) {
          const draftTask = JSON.parse(await AsyncStorage.getItem(key));
          const tasksCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
          await addDoc(tasksCollectionRef, draftTask);
          await AsyncStorage.removeItem(key);
        }
      }
    };
    syncTasks();
  }, [userId, scheduleId]);

  const handleSave = async () => {
    console.log('handleSave triggered'); // Debug log
    try {
      setLoading(true);
      const taskData = {
        title,
        description,
        dueDate,
        priority,
        repeat,
        repeatInterval,
      };
  
      const netInfo = await NetInfo.fetch();
      console.log('Network info:', netInfo); // Debug log
  
      if (netInfo.isConnected) {
        const tasksCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
        await addDoc(tasksCollectionRef, taskData);
        console.log('Task saved to firestore:', taskData); // Debug log
        navigation.dispatch(CommonActions.navigate('Home'));
      } else {
        console.log('Saving task offline:', taskData); // Debug log
        await saveDraftTask();
        Alert.alert('No Internet', 'Task saved locally. It will be synced when you are online.');
        console.log('Task saved locally:', taskData); // Debug log
        navigation.dispatch(CommonActions.navigate('Home'));
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDueDateConfirm = (date) => {
    setDueDate(date);
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  return (
    <ScrollView style={styles.container}>
      <Text h4 style={styles.title}>Create Task</Text>
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
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={styles.input}>{dueDate ? dueDate.toLocaleString() : 'Due Date'}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDueDateConfirm}
        onCancel={hideDatePicker}
      />
      <View style={styles.priorityContainer}>
        <Text style={styles.label}>Priority:</Text>
        <TouchableOpacity onPress={() => handlePriorityChange(1)} style={[styles.priorityButton, priority === 1 && styles.priorityButtonSelected]}>
          <Text style={styles.priorityButtonText}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePriorityChange(2)} style={[styles.priorityButton, priority === 2 && styles.priorityButtonSelected]}>
          <Text style={styles.priorityButtonText}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePriorityChange(3)} style={[styles.priorityButton, priority === 3 && styles.priorityButtonSelected]}>
          <Text style={styles.priorityButtonText}>High</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Save Task</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.button}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
      <Text style={styles.offlineText}>If offline just click save once and press home</Text>
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
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    marginRight: 8,
  },
  priorityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  priorityButtonSelected: {
    backgroundColor: '#007bff',
  },
  priorityButtonText: {
    color: '#fff',
  },
  offlineText: {
    color: 'black',
    textAlign: 'center',
  },
});

export default TaskScreen;
