import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';

const CustomButton = ({ title, onPress, color }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const ViewScreen = ({ navigation, route }) => {
  const { userId, scheduleId, taskId } = route.params;
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId));
        if (taskDoc.exists()) {
          setTask(taskDoc.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();
  }, [userId, scheduleId, taskId]);

  const deleteTask = async () => {
    try {
      await deleteDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', taskId));
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
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
          {task.dueDate ? task.dueDate.toDate().toLocaleDateString() : 'No Due Date'}
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
