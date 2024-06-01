import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CustomButton = ({ title, onPress, color }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const ViewScreen = ({ navigation, route }) => {
  const { userId, scheduleId, taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        // Fetch task from AsyncStorage
        console.log('Fetching task from AsyncStorage');
        const cachedTask = await AsyncStorage.getItem(`task_${taskId}`);
        if (cachedTask) {
          console.log('Cached task found');
          setTask(JSON.parse(cachedTask));
          setLoading(false); // Stop loading spinner when cached data is found
        } else {
          console.log('No cached task found');
        }

        // Check network status and fetch from Firestore if online
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          console.log('Fetching task from Firestore');
          const taskDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId));
          if (taskDoc.exists()) {
            const taskData = taskDoc.data();
            setTask(taskData);
            await AsyncStorage.setItem(`task_${taskId}`, JSON.stringify(taskData));
          } else {
            console.log('No such document!');
            if (!cachedTask) {
              Alert.alert('Error', 'Task not found and no cached data available.');
            }
          }
        } else if (!cachedTask) {
          Alert.alert('Error', 'No internet connection and no cached data available.');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
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
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Error deleting task. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Task not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{task.title}</Text>
      </View>
      <Text style={styles.header}>Description</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{task.description}</Text>
      </Card>
      <Text style={styles.header}>Due date</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>
          {task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'No Due Date'}
        </Text>
      </Card>
      <Text style={styles.header}>Priority level</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{task.priority}</Text>
      </Card>
      <Text style={styles.header}>Repeat</Text>
      <Card containerStyle={styles.card}>
        <Text style={styles.text}>{task.repeat ? `Every ${task.repeatInterval} days` : 'No'}</Text>
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Edit Task" onPress={() => navigation.navigate('Task', { userId, scheduleId, taskId })} color="#3498db" />
        <CustomButton title="Back" onPress={() => navigation.navigate('Calendar', { userId, scheduleId })} color="#3498db" />
        <CustomButton title="Delete Task" onPress={deleteTask} color="red" />
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

export default ViewScreen;
