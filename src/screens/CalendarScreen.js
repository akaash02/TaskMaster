// /src/screens/CalendarScreen.js

import React, { useState, useCallback, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Text, Icon } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import { firestore } from '../config/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import CircularDropdown from '../components/CircularDropdown';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes';

const CalendarScreen = ({ navigation, route }) => {
  const { userId, scheduleId } = route.params;
  const { theme } = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchTasksAndEvents = () => {
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

      if (userId && scheduleId) {
        fetchTasksAndEvents();
      }
    }, [userId, scheduleId])
  );

  const renderItemsForDate = (date) => {
    const tasksForDate = tasks.filter(
      task => new Date(task.dueDate.toDate()).toDateString() === date.toDateString()
    );

    const eventsForDate = events.filter(
      event => new Date(event.startTime.toDate()).toDateString() === date.toDateString()
    );

    return (
      <>
        {tasksForDate.map(task => (
          <TouchableOpacity 
            key={task.id} 
            onPress={() => navigation.navigate('ViewTask', { userId, scheduleId, taskId: task.id })}>
            <View style={[styles.item, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Title: {task.title}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Description: {task.description}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Priority: {task.priority}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat: {task.repeat ? 'Yes' : 'No'}</Text>
              {task.repeat && <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat Interval: {task.repeatInterval}</Text>}
            </View>
          </TouchableOpacity>
        ))}
        {eventsForDate.map(event => (
          <TouchableOpacity 
            key={event.id} 
            onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
            <View style={[styles.item, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Title: {event.title}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Location: {event.location}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Start: {new Date(event.startTime.toDate()).toLocaleString()}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>End: {new Date(event.endTime.toDate()).toLocaleString()}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
              <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat: {event.repeat ? 'Yes' : 'No'}</Text>
              {event.repeat && <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat Interval: {event.repeatInterval}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };

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
        centerComponent={{ text: 'My Calendar', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <ScrollView>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader} />
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
        </View>
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
          {loading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
          ) : (
            <>
              {tasks.map(task => (
                <TouchableOpacity 
                  key={task.id} 
                  onPress={() => navigation.navigate('View', { userId, scheduleId, taskId: task.id })}>
                  <View style={[styles.item, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Title: {task.title}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Description: {task.description}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Priority: {task.priority}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat: {task.repeat ? 'Yes' : 'No'}</Text>
                    {task.repeat && <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat Interval: {task.repeatInterval}</Text>}
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>{task.dueDate.toDate().toDateString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {events.map(event => (
                <TouchableOpacity 
                  key={event.id} 
                  onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
                  <View style={[styles.item, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Title: {event.title}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Location: {event.location}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Start: {new Date(event.startTime.toDate()).toLocaleString()}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>End: {new Date(event.endTime.toDate()).toLocaleString()}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat: {event.repeat ? 'Yes' : 'No'}</Text>
                    {event.repeat && <Text style={[styles.itemText, { color: theme.colors.text }]}>Repeat Interval: {event.repeatInterval}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.card }]}>
        <Icon
          name="home"
          type="material"
          onPress={() => navigation.navigate('Home')}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name="calendar-today"
          type="material"
          onPress={() => navigation.navigate('Calendar', { userId, scheduleId })}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name="people"
          type="material"
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name="person"
          type="material"
          onPress={() => navigation.navigate('Profile')}
          size={30}
          color={theme.colors.text}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 40,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  tasksContainer: {
    marginHorizontal: 20,
    marginTop: 20,
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
  item: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CalendarScreen;
