import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Text, Icon } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import { firestore } from '../config/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import CircularDropdown from '../components/CircularDropdown';

const CalendarScreen = ({ navigation, route }) => {
  const { userId, scheduleId } = route.params;
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
            <View style={styles.item}>
              <Text style={styles.itemText}>Title: {task.title}</Text>
              <Text style={styles.itemText}>Description: {task.description}</Text>
              <Text style={styles.itemText}>Priority: {task.priority}</Text>
              <Text style={styles.itemText}>Repeat: {task.repeat ? 'Yes' : 'No'}</Text>
              {task.repeat && <Text style={styles.itemText}>Repeat Interval: {task.repeatInterval}</Text>}
            </View>
          </TouchableOpacity>
        ))}
        {eventsForDate.map(event => (
          <TouchableOpacity 
            key={event.id} 
            onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
            <View style={styles.item}>
              <Text style={styles.itemText}>Title: {event.title}</Text>
              <Text style={styles.itemText}>Location: {event.location}</Text>
              <Text style={styles.itemText}>Start: {new Date(event.startTime.toDate()).toLocaleString()}</Text>
              <Text style={styles.itemText}>End: {new Date(event.endTime.toDate()).toLocaleString()}</Text>
              <Text style={styles.itemText}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
              <Text style={styles.itemText}>Repeat: {event.repeat ? 'Yes' : 'No'}</Text>
              {event.repeat && <Text style={styles.itemText}>Repeat Interval: {event.repeatInterval}</Text>}
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
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'My Calendar', style: styles.headerText }}
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
              textSectionTitleColor: '#fff',
              textSectionTitleDisabledColor: '#d9e1e8',
              selectedDayBackgroundColor: '#6aa8f2',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6aa8f2',
              dayTextColor: '#ffffff',
              textDisabledColor: '#2d4150',
              dotColor: '#6aa8f2',
              selectedDotColor: '#ffffff',
              arrowColor: '#ffffff',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#ffffff',
              indicatorColor: '#ffffff',
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
            <Text style={styles.tasksHeaderText}>My Tasks & Events</Text>
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
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <>
              {tasks.map(task => (
                <TouchableOpacity 
                  key={task.id} 
                  onPress={() => navigation.navigate('View', { userId, scheduleId, taskId: task.id })}>
                  <View style={styles.item}>
                    <Text style={styles.itemText}>Title: {task.title}</Text>
                    <Text style={styles.itemText}>Description: {task.description}</Text>
                    <Text style={styles.itemText}>Priority: {task.priority}</Text>
                    <Text style={styles.itemText}>Repeat: {task.repeat ? 'Yes' : 'No'}</Text>
                    {task.repeat && <Text style={styles.itemText}>Repeat Interval: {task.repeatInterval}</Text>}
                    <Text style={styles.itemText}>{task.dueDate.toDate().toDateString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {events.map(event => (
                <TouchableOpacity 
                  key={event.id} 
                  onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
                  <View style={styles.item}>
                    <Text style={styles.itemText}>Title: {event.title}</Text>
                    <Text style={styles.itemText}>Location: {event.location}</Text>
                    <Text style={styles.itemText}>Start: {new Date(event.startTime.toDate()).toLocaleString()}</Text>
                    <Text style={styles.itemText}>End: {new Date(event.endTime.toDate()).toLocaleString()}</Text>
                    <Text style={styles.itemText}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
                    <Text style={styles.itemText}>Repeat: {event.repeat ? 'Yes' : 'No'}</Text>
                    {event.repeat && <Text style={styles.itemText}>Repeat Interval: {event.repeatInterval}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <Icon
          name="home"
          type="material"
          onPress={() => navigation.navigate('Home')}
          size={30}
          color="#03012E"
        />
        <Icon
          name="calendar-today"
          type="material"
          onPress={() => navigation.navigate('Calendar', { userId, scheduleId })}
          size={30}
          color="#03012E"
        />
        <Icon
          name="people"
          type="material"
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color="#03012E"
        />
        <Icon
          name="person"
          type="material"
          onPress={() => navigation.navigate('Profile')}
          size={30}
          color="#03012E"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03012E',
  },
  headerContainer: {
    paddingTop: 40,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemText: {
    color: 'black',
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CalendarScreen;
