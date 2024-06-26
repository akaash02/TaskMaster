import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes/iThemeIdex';

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

  const deleteTask = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await deleteDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId));
      }
      await AsyncStorage.removeItem(`task_${taskId}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Error deleting task. Please try again.');
    }
  };

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
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.duration ? `${task.duration} hours` : 'No duration'}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Difficulty</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.difficulty ? `${task.difficulty}/5` : 'No difficulty'}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Priority</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.priority || 'No priority'}</Text>
      </Card>
      {task.repeat && (
        <>
          <Text style={[styles.header, { color: theme.colors.text }]}>Repeat Interval</Text>
          <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.text, { color: theme.colors.text }]}>{task.repeatInterval || 'No interval'}</Text>
          </Card>
        </>
      )}
      <Text style={[styles.header, { color: theme.colors.text }]}>Deadline</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatDate(task.dueDate)}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Start Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatTime(task.startTime)}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>End Time</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{formatTime(task.endTime)}</Text>
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Edit Task" onPress={() => navigation.navigate('EditTask', { userId, scheduleId, taskId })} color={theme.colors.text} textColor={theme.colors.background} />
        <CustomButton title="Delete Task" onPress={deleteTask} color="red" textColor="white" />
        <CustomButton title="Home" onPress={() => navigation.navigate('Home')} color={theme.colors.text} textColor={theme.colors.background} />
      </View>
    </ScrollView>
    
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
    marginBottom: "20%",
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

export default ViewTaskScreen;
