import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions } from '@react-navigation/native';
import { ThemeContext } from '../themses/ThemeContext';

const TaskScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const scheduleId = route?.params?.scheduleId;
  const { theme } = useContext(ThemeContext);

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
      console.log('Draft task saved:', taskData);
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
    console.log('handleSave triggered');
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
      console.log('Network info:', netInfo);
  
      if (netInfo.isConnected) {
        const tasksCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
        await addDoc(tasksCollectionRef, taskData);
        console.log('Task saved to firestore:', taskData);
        navigation.dispatch(CommonActions.navigate('Home'));
      } else {
        console.log('Saving task offline:', taskData);
        await saveDraftTask();
        Alert.alert('No Internet', 'Task saved locally. It will be synced when you are online.');
        console.log('Task saved locally:', taskData);
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.title, { color: theme.colors.text }]}>Create Task</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Title"
        placeholderTextColor={theme.colors.placeholder}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Description"
        placeholderTextColor={theme.colors.placeholder}
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity onPress={showDatePicker}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {dueDate ? dueDate.toLocaleString() : 'Due Date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDueDateConfirm}
        onCancel={hideDatePicker}
      />
      <View style={styles.priorityContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Priority:</Text>
        <TouchableOpacity
          onPress={() => handlePriorityChange(1)}
          style={[styles.priorityButton, priority === 1 && { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.priorityButtonText, priority === 1 && { color: theme.colors.buttonText }]}>Low          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePriorityChange(2)}
          style={[styles.priorityButton, priority === 2 && { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.priorityButtonText, priority === 2 && { color: theme.colors.buttonText }]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePriorityChange(3)}
          style={[styles.priorityButton, priority === 3 && { backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.priorityButtonText, priority === 3 && { color: theme.colors.buttonText }]}>High</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Save Task</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Home</Text>
      </TouchableOpacity>
      <Text style={[styles.offlineText, { color: theme.colors.text }]}>
        If offline just click save once and press home
      </Text>
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
    borderRadius: 4,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
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
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  priorityButtonText: {},
  offlineText: {
    textAlign: 'center',
  },
});

export default TaskScreen;

