import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Icon } from 'react-native-elements';
import { auth, firestore } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import CircularDropdown from '../components/CircularDropdown';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes/iThemeIdex';

const HomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const scheduleId = 'yourScheduleId';

  const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
  const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
  const dates = [];
  for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserName = async (userId) => {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name);
          }
        } catch (error) {
          console.error('Error fetching user name:', error.message);
        }
      };

      const fetchTasksAndEvents = (userId) => {
        const tasksRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
        const eventsRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');

        const unsubscribeTasks = onSnapshot(tasksRef, (querySnapshot) => {
          const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTasks(tasksList);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching tasks:', error.message);
          setLoading(false);
        });

        const unsubscribeEvents = onSnapshot(eventsRef, (querySnapshot) => {
          const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(eventsList);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching events:', error.message);
          setLoading(false);
        });

        return () => {
          unsubscribeTasks();
          unsubscribeEvents();
        };
      };

      if (userId) {
        fetchUserName(userId);
        return fetchTasksAndEvents(userId);
      }
    }, [userId])
  );

  const handleDropdownSelect = (option) => {
    if (option.value === 'task') {
      navigation.navigate('Task', { userId, scheduleId });
    } else if (option.value === 'event') {
      navigation.navigate('Event', { userId, scheduleId });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.headerText, { color: theme.colors.text }]}>Hello {userName}!</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={[styles.card, styles.dateCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.weekDaysContainer}>
              {dates.map((date, index) => (
                <TouchableOpacity key={index} style={[
                  styles.weekDayBox,
                  date.toDateString() === new Date().toDateString() && [styles.currentDayBox, { backgroundColor: theme.colors.text }]
                ]}>
                  <Text style={date.toDateString() === new Date().toDateString() ? [styles.currentWeekDayText, { color: theme.colors.background }] : [styles.weekDayText, { color: theme.colors.text }]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={date.toDateString() === new Date().toDateString() ? [styles.currentWeekDayText, { color: theme.colors.background }] : [styles.weekDayText, { color: theme.colors.text }]}>
                    {date.toLocaleDateString('en-GB', { day: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.iconRow}>
            <CircularDropdown
              icon="add"
              options={[
                { label: 'Task', value: 'task' },
                { label: 'Event', value: 'event' },
              ]}
              onSelect={handleDropdownSelect}
            />
            <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
              <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Icon name="people" type="material" size={27} color={theme.colors.text} />
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Card containerStyle={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Icon name="person" type="material" size={27} color={theme.colors.text} />
              </Card>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar', { userId, scheduleId })}>
            <Text style={[styles.mytasksText, { color: theme.colors.text }]}>My Tasks & Events</Text>
          </TouchableOpacity>
          {loading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
          ) : (
            <View style={styles.tasksContainer}>
              {tasks.map(task => (
                <TouchableOpacity key={task.id} onPress={() => navigation.navigate('ViewTask', { userId, scheduleId, taskId: task.id })}>
                  <View style={[styles.taskItem, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Title: {task.title || 'No title'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Priority: {task.priority || 'No priority'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No due date'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Start Time: {task.startTime ? new Date(task.startTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No start time'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>End Time: {task.endTime ? new Date(task.endTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No end time'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Duration: {task.duration ? `${task.duration} hours` : 'No duration'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Difficulty: {task.difficulty ? `${task.difficulty}/5` : 'No difficulty'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {events.map(event => (
                <TouchableOpacity key={event.id} onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
                  <View style={[styles.taskItem, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Title: {event.title || 'No title'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Location: {event.location || 'No location'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>Start: {event.startTime ? new Date(event.startTime.toDate()).toLocaleString() : 'No start time'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>End: {event.endTime ? new Date(event.endTime.toDate()).toLocaleString() : 'No end time'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
    margin: 20,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  dateCard: {
    height: '15%',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  mytasksText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tasksContainer: {
    width: '90%', 
    alignSelf: 'center', 
  },
  taskItem: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%', 
  },
  taskText: {
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  dateContainer: {
    alignItems: 'center',
  },
  date: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  day: {
    fontSize: 20,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: '5%', 
  },
  weekDayBox: {
    width: '13%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '2%', 
  },
  currentDayBox: {
    borderWidth: 1,
    borderRadius: 10,
  },
  weekDayText: {
    fontSize: 20,
    textAlign: 'center',
  },
  currentWeekDayText: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
