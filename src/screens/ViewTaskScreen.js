import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
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

const ViewTaskScreen = ({ route, navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { userId, scheduleId, taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const cachedTask = await AsyncStorage.getItem(`task_${taskId}`);
        if (cachedTask) {
          setTask(JSON.parse(cachedTask));
          setLoading(false);
        }

        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          const taskDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId));
          if (taskDoc.exists()) {
            const taskData = taskDoc.data();
            setTask(taskData);
            await AsyncStorage.setItem(`task_${taskId}`, JSON.stringify(taskData));
          } else if (!cachedTask) {
            Alert.alert('Error', 'Task not found and no cached data available.');
          }
        } else if (!cachedTask) {
          Alert.alert('Error', 'No internet connection and no cached data available.');
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching task data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [userId, scheduleId, taskId]);

  const updateTaskCompleteField = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const taskDocRef = doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId);
        const taskSnap = await getDoc(taskDocRef);
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          const taskDuration = parseFloat(taskData.duration) || 0;

          await updateDoc(taskDocRef, { isComplete: true });

          const currentMonth = new Date().toISOString().slice(0, 7);
          const currentDay = new Date().getDate().toString();
          const taskAnalyticsRef = doc(firestore, 'users', userId, 'analytics', 'analyticsData', 'taskAnalytics', currentMonth);
          const taskAnalyticsSnap = await getDoc(taskAnalyticsRef);

          if (taskAnalyticsSnap.exists()) {
            const taskAnalyticsData = taskAnalyticsSnap.data();
            const newHeatmap = taskAnalyticsData.heatmap || {};
            newHeatmap[currentDay] = (newHeatmap[currentDay] || 0) + 1;

            await updateDoc(taskAnalyticsRef, {
              tasksCompleted: (taskAnalyticsData.tasksCompleted || 0) + 1,
              hoursSpent: (parseFloat(taskAnalyticsData.hoursSpent) || 0) + taskDuration,
              heatmap: newHeatmap,
            });
          } else {
            await setDoc(taskAnalyticsRef, {
              tasksCompleted: 1,
              tasksDeleted: 0,
              tasksTotal: 0,
              hoursSpent: taskDuration,
              heatmap: { [currentDay]: 1 },
            });
          }

          setTask((prevTask) => ({
            ...prevTask,
            isComplete: true,
          }));
          await AsyncStorage.setItem(`task_${taskId}`, JSON.stringify({ ...taskData, isComplete: true }));
        } else {
          Alert.alert('Error', 'Task not found.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating task. Please try again.');
    }
  };

  const updateDeleteTaskField = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const taskDocRef = doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId);
        await updateDoc(taskDocRef, { isComplete: true });

        const currentMonth = new Date().toISOString().slice(0, 7);
        const taskAnalyticsRef = doc(firestore, 'users', userId, 'analytics', 'analyticsData', 'taskAnalytics', currentMonth);
        const taskAnalyticsSnap = await getDoc(taskAnalyticsRef);

        if (taskAnalyticsSnap.exists()) {
          const taskAnalyticsData = taskAnalyticsSnap.data();
          await updateDoc(taskAnalyticsRef, {
            tasksDeleted: (taskAnalyticsData.tasksDeleted || 0) + 1,
          });
        } else {
          await setDoc(taskAnalyticsRef, {
            tasksCompleted: 0,
            tasksDeleted: 1,
            tasksTotal: 0,
            hoursSpent: 0,
          });
        }

        setTask((prevTask) => ({
          ...prevTask,
          isComplete: true,
        }));
        await AsyncStorage.setItem(`task_${taskId}`, JSON.stringify({ ...task, isComplete: true }));
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating task. Please try again.');
    }
  };

  const completeTask = () => updateTaskCompleteField();
  const deleteTask = () => updateDeleteTaskField();

  const formatDate = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toDateString();
    }
    return 'No Date';
  };

  const formatTime = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString();
    }
    return 'No Time';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>Task not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
      </View>
      <Text style={[styles.header, { color: theme.colors.text }]}>Duration</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.duration ? `${task.duration} hours` : 'No duration'}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Difficulty</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.difficulty ? `${task.difficulty}/5` : 'No difficulty'}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Priority</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.priority || 'No priority'}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Deadline</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatDate(task.dueDate)}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Start Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatTime(task.startTime)}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>End Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatTime(task.endTime)}</Text>
      </Card>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={completeTask}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Complete Task</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={deleteTask}>
        <Text style={[styles.buttonText, { color: theme.colors.buttonText }]}>Delete Task</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[styles.button, { backgroundColor: theme.colors.text }]}>
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('EditTask', { userId, scheduleId, taskId })} style={[styles.button, { backgroundColor: theme.colors.text, marginBottom: 90 }]}>
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>Edit Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    marginLeft: '3%',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
  },
  card: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginRight: '3.5%',
    marginLeft: '3%',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ViewTaskScreen;
