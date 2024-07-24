import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore } from '../config/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions } from '@react-navigation/native';
import { ThemeContext } from '../navigation/AppNavigator';

import { fetchAndScheduleTasks } from '../components/taskUtils';

const TaskScreen = ({ navigation, route }) => {
  const userId = route?.params?.userId;
  const scheduleId = route?.params?.scheduleId;
  const { theme } = useContext(ThemeContext);

  if (!theme) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Theme context is not available.</Text>
      </View>
    );
  }

  if (!userId || !scheduleId) {
    console.error('userId or scheduleId is undefined');
    navigation.navigate('Home');
    return null;
  }

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState(1); // Default priority to 1
  const [duration, setDuration] = useState(''); // New field for duration
  const [difficulty, setDifficulty] = useState(''); // New field for difficulty
  const [isDueDatePickerVisible, setDueDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDraftTask = async () => {
      try {
        const draftTask = await AsyncStorage.getItem(`draftTask-${userId}-${scheduleId}`);
        if (draftTask) {
          const parsedTask = JSON.parse(draftTask);
          setTitle(parsedTask.title);
          setDueDate(new Date(parsedTask.dueDate));
          setPriority(parsedTask.priority);
          setDuration(parsedTask.duration); // Load duration from draft
          setDifficulty(parsedTask.difficulty); // Load difficulty from draft
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
      dueDate: dueDate?.toISOString(),
      priority,
      duration,
      difficulty,
      isComplete: false, // Set isComplete to false by default
      startTime: '2024-01-01T00:00:00.000Z', // Arbitrary start time
      endTime: '2024-01-01T01:00:00.000Z', // Arbitrary end time
    };
    try {
      await AsyncStorage.setItem(`draftTask-${userId}-${scheduleId}`, JSON.stringify(taskData));
      console.log('Draft task saved:', taskData);
      Alert.alert('Draft Saved', 'Draft task has been saved locally.');
      navigation.dispatch(CommonActions.navigate('Home'));
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
        dueDate,
        priority,
        duration,
        difficulty,
        isComplete: false, // Set isComplete to false by default
        startTime: '2024-01-01T00:00:00.000Z', // Arbitrary start time
        endTime: '2024-01-01T01:00:00.000Z', // Arbitrary end time
      };
  
      const netInfo = await NetInfo.fetch();
      console.log('Network info:', netInfo);
  
      if (netInfo.isConnected) {
        const tasksCollectionRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
        await addDoc(tasksCollectionRef, taskData);
        console.log('Task saved to firestore:', taskData);
        
        // Increment tasksTotal in taskAnalytics for the current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const taskAnalyticsRef = doc(firestore, 'users', userId, 'analytics', 'analyticsData', 'taskAnalytics', currentMonth);
        const taskAnalyticsSnap = await getDoc(taskAnalyticsRef);

        if (taskAnalyticsSnap.exists()) {
          const taskAnalyticsData = taskAnalyticsSnap.data();
          await updateDoc(taskAnalyticsRef, {
            tasksTotal: (taskAnalyticsData.tasksTotal || 0) + 1,
          });
        } else {
          await setDoc(taskAnalyticsRef, {
            tasksCompleted: 0,
            tasksDeleted: 0,
            tasksTotal: 1,
            hoursSpent: 0,
          });
        }
        
        // Call fetchAndScheduleTasks to schedule tasks after saving
        console.log('Calling fetchAndScheduleTasks');
        await fetchAndScheduleTasks(userId, scheduleId);
        console.log('fetchAndScheduleTasks completed');
        navigation.navigate('Home');
      } else {
        console.log('Saving task offline:', taskData);
        await saveDraftTask();
        Alert.alert('No Internet', 'Task saved locally. It will be synced when you are online.');
        console.log('Task saved locally:', taskData);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDueDateConfirm = (date) => {
    setDueDate(date);
    setDueDatePickerVisibility(false);
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h1 style={[styles.title, { color: theme.colors.text }]}>Create Task</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.colors.text, color: theme.colors.text }]}
        placeholder="Title"
        placeholderTextColor={theme.colors.placeholder}
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity onPress={() => setDueDatePickerVisibility(true)}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {dueDate ? dueDate.toLocaleString() : 'Due Date'}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDueDatePickerVisible}
        mode="datetime"
        onConfirm={handleDueDateConfirm}
        onCancel={() => setDueDatePickerVisibility(false)}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.colors.text, color: theme.colors.text }]}
        placeholder="Duration (in hours)"
        placeholderTextColor={theme.colors.placeholder}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />
      <TextInput
        style={[styles.input, { borderColor: theme.colors.text, color: theme.colors.text }]}
        placeholder="Difficulty (1-5)"
        placeholderTextColor={theme.colors.placeholder}
        value={difficulty}
        onChangeText={setDifficulty}
        keyboardType="numeric"
      />
      <View style={styles.priorityContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Priority:</Text>
        <TouchableOpacity
          onPress={() => handlePriorityChange(1)}
          style={[
            styles.priorityButton,
            priority === 1 && { backgroundColor: theme.colors.text, color: theme.colors.background },
          ]}
        >
          <Text style={[styles.priorityButtonText, priority === 1 && { color: theme.colors.background }]}>Low</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePriorityChange(2)}
          style={[
            styles.priorityButton,
            priority === 2 && { backgroundColor: theme.colors.text, color: theme.colors.background },
          ]}
        >
          <Text style={[styles.priorityButtonText, priority === 2 && { color: theme.colors.background }]}>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePriorityChange(3)}
          style={[
            styles.priorityButton,
            priority === 3 && { backgroundColor: theme.colors.text, color: theme.colors.background },
          ]}
        >
          <Text style={[styles.priorityButtonText, priority === 3 && { color: theme.colors.background }]}>High</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleSave}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Save Task</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.button, { backgroundColor: theme.colors.text }]}>
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: "5%",
  },
  title: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    marginRight: 8,
  },
  priorityButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityButtonText: {
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
  },
  errorText: {
    color: 'red',
  },
});

export default TaskScreen;
