import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { firestore } from '../config/firebaseConfig';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Card } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes';

const CustomButton = ({ title, onPress, color, textColor }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

const ViewScreen = ({ navigation, route }) => {
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
      </View>
      <Text style={[styles.header, { color: theme.colors.text }]}>Description</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.description}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Due date</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>
          {task.dueDate ? new Date(task.dueDate.seconds * 1000).toLocaleDateString() : 'No Due Date'}
        </Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Priority level</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.priority}</Text>
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Repeat</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>{task.repeat ? `Every ${task.repeatInterval} days` : 'No'}</Text>
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Edit Task" onPress={() => navigation.navigate('Task', { userId, scheduleId, taskId })} color={theme.colors.card} textColor={theme.colors.text} />
        <CustomButton title="Back" onPress={() => navigation.navigate('Calendar', { userId, scheduleId })} color={theme.colors.card} textColor={theme.colors.text} />
        <CustomButton title="Delete Task" onPress={deleteTask} color="red" textColor='white' />
      </View>
    </View>
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
  },
  button: {
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default ViewScreen;
