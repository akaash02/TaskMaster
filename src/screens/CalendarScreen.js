import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Icon, Header } from 'react-native-elements';
import { auth, firestore } from '../config/firebaseConfig';
import { Calendar } from 'react-native-calendars';
import { onAuthStateChanged } from 'firebase/auth';
import CircularDropdown from '../components/CircularDropdown';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';
import NavBar from '../components/NavBar';

const CalendarScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [userId, setUserId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scheduleId = 'yourScheduleId';

  const currentDate = new Date();
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

  useEffect(() => {
    if (userId) {
      const tasksRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
      const eventsRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');

      const incompleteTasksQuery = query(tasksRef, where('completed', '==', false));

      const unsubscribeTasks = onSnapshot(incompleteTasksQuery, (querySnapshot) => {
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
    }
  }, [userId]);

  const handleDropdownSelect = (option) => {
    if (option.value === 'task') {
      navigation.navigate('Task', { userId, scheduleId });
    } else if (option.value === 'event') {
      navigation.navigate('Event', { userId, scheduleId });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        centerComponent={{ text: 'Calendar', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.card }]}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
        <Calendar
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: theme.colors.text,
              textSectionTitleDisabledColor: '#d9e1e8',
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text,
              textDisabledColor: '#2d4150',
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.text,
              disabledArrowColor: '#d9e1e8',
              monthTextColor: theme.colors.text,
              indicatorColor: theme.colors.text,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
            }}
            onDayPress={(day) => {
              console.log('selected day', day);
              renderItemsForDate(new Date(day.timestamp));
            }}
          />
          {loading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
          ) : (
            <View style={styles.tasksContainer}>
              <View style={styles.tasksHeader}>
            <Text style={[styles.tasksHeaderText, { color: theme.colors.text }]}>My Tasks & Events</Text>
            <CircularDropdown
              icon="add"
              options={[
                { label: 'Task', value: 'task' },
                { label: 'Event', value: 'event' },
              ]}
              onSelect={handleDropdownSelect}
            />
          </View>
              {tasks.map(task => (
                <TouchableOpacity key={task.id} onPress={() => navigation.navigate('ViewTask', { userId, scheduleId, taskId: task.id })}>
                <View style={[styles.taskItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title || 'No title'}</Text>
                  <View style={styles.taskDetailsContainer}>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}> {task.priority ? (task.priority === 1 ? 'Low Priority' : task.priority === 2 ? 'Medium Priority' : 'High Priority') : 'No priority'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>
                      {task.startTime ? new Date(task.startTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No start time'} - {task.endTime ? new Date(task.endTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No end time'}
                    </Text>
                  </View>
                  <Text style={[styles.taskText, { color: theme.colors.text }]}> {task.duration ? `${task.duration} hours` : 'No duration'}</Text>
                  <Text style={[styles.taskText, { color: theme.colors.text }]}> {task.difficulty ? `${task.difficulty}/5 difficulty` : 'No difficulty'}</Text>
                </View>
              </TouchableOpacity>
              ))}
              {events.map(event => (
                <TouchableOpacity key={event.id} onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
                <View style={[styles.taskItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}>
                  <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{event.title || 'No title'}</Text>
                  <View style={styles.eventDetailsContainer}>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>{event.location || 'No location'}</Text>
                    <Text style={[styles.taskText, { color: theme.colors.text }]}>
                      {event.startTime ? new Date(event.startTime.toDate()).toLocaleString() : 'No start time'} - {event.endTime ? new Date(event.endTime.toDate()).toLocaleString() : 'No end time'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <NavBar navigation={navigation} userId={'yourUserId'} scheduleId={'yourScheduleId'} />
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
  headerContainer: {
    paddingTop: 20,
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 45,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  card: {
    borderRadius: 20,
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
  tasksContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  taskItem: {
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
    borderWidth: 1.5,
  },
  taskTitle: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  taskText: {
    fontSize: 18,
  },
  eventDetailsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 5,
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
    borderRadius: 10,
  },
  weekDayText: {
    fontSize: 16,
  },
  currentDayBox: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  currentWeekDayText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tasksHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
