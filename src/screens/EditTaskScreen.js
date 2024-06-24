import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebaseConfig';
import { ThemeContext } from '../navigation/AppNavigator';
import { Card } from 'react-native-elements';

const CustomButton = ({ title, onPress, color, textColor }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
    <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

const EditTaskScreen = ({ route, navigation }) => {
  const { userId, scheduleId, taskId } = route.params;
  const { theme } = useContext(ThemeContext);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [priority, setPriority] = useState('');
  const [repeat, setRepeat] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(doc(firestore, `users/${userId}/schedules/${scheduleId}/tasks/${taskId}`));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          setTitle(taskData.title || '');
          setDuration(taskData.duration || '');
          setDifficulty(taskData.difficulty || '');
          setPriority(taskData.priority || '');
          setRepeat(taskData.repeat || '');
          setDeadline(taskData.deadline || '');
        }
      } catch (error) {
        Alert.alert("Error fetching task", error.message);
      }
    };

    fetchTask();
  }, [userId, scheduleId, taskId]);

  const handleSaveTask = async () => {
    try {
      await setDoc(doc(firestore, `users/${userId}/schedules/${scheduleId}/tasks/${taskId}`), {
        title,
        duration,
        difficulty,
        priority,
        repeat: repeat || '',
        deadline,
      }, { merge: true });
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert("Error saving task", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit Task</Text>
      </View>
      <Text style={[styles.header, { color: theme.colors.text }]}>Title</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={title}
          onChangeText={setTitle}
        />
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Duration</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={duration}
          onChangeText={setDuration}
        />
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Difficulty</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={difficulty}
          onChangeText={setDifficulty}
        />
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Priority</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={priority}
          onChangeText={setPriority}
        />
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Repeat</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={repeat}
          onChangeText={setRepeat}
        />
      </Card>
      <Text style={[styles.header, { color: theme.colors.text }]}>Deadline</Text>
      <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          value={deadline}
          onChangeText={setDeadline}
        />
      </Card>
      <View style={styles.buttons}>
        <CustomButton title="Save Task" onPress={handleSaveTask} color={theme.colors.card} textColor={theme.colors.text} />
        <CustomButton title="Home" onPress={() => navigation.navigate('Home')} color={theme.colors.card} textColor={theme.colors.text} />
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
  input: {
    fontSize: 16,
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

export default EditTaskScreen;
