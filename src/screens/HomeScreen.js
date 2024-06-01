import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Header, Icon, Card } from 'react-native-elements';
import { auth, firestore } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import CircularDropdown from '../components/CircularDropdown';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scheduleId = 'yourScheduleId';

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
          setLoading(false); // Set loading to false once data is fetched
        }, (error) => {
          console.error('Error fetching tasks:', error.message);
          setLoading(false); // Set loading to false in case of error
        });

        const unsubscribeEvents = onSnapshot(eventsRef, (querySnapshot) => {
          const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEvents(eventsList);
          setLoading(false); // Set loading to false once data is fetched
        }, (error) => {
          console.error('Error fetching events:', error.message);
          setLoading(false); // Set loading to false in case of error
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

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

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
        centerComponent={{ text: `Hello ${userName}!`, style: styles.headerText }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <Image
        source={require('../../assets/main_logo_no_text.png')}
        style={styles.logo}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card containerStyle={[styles.card, styles.dateCard]}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text style={styles.day}>{formattedDay}</Text>
            </View>
          </Card>
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
              <Card containerStyle={[styles.card, styles.iconCard]}>
                <Icon name="people" type="material" size={27} color="#03012E" />
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Card containerStyle={[styles.card, styles.iconCard]}>
                <Icon name="person" type="material" size={27} color="#03012E" />
              </Card>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar', { userId, scheduleId })}>
            <Text style={styles.mytasksText}>My Tasks & Events</Text>
          </TouchableOpacity>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <View style={styles.tasksContainer}>
              {tasks.map(task => (
                <TouchableOpacity key={task.id} onPress={() => navigation.navigate('View', { userId, scheduleId, taskId: task.id })}>
                  <View style={styles.taskItem}>
                    <Text style={styles.taskText}>Title: {task.title || 'No title'}</Text>
                    <Text style={styles.taskText}>Description: {task.description || 'No description'}</Text>
                    <Text style={styles.taskText}>Priority: {task.priority || 'No priority'}</Text>
                    <Text style={styles.taskText}>Repeat: {task.repeat ? 'Yes' : 'No'}</Text>
                    {task.repeat && <Text style={styles.taskText}>Repeat Interval: {task.repeatInterval || 'No interval'}</Text>}
                    <Text style={styles.taskText}>Due Date: {task.dueDate ? task.dueDate.toDate().toDateString() : 'No due date'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {events.map(event => (
                <TouchableOpacity key={event.id} onPress={() => navigation.navigate('ViewEvent', { userId, scheduleId, eventId: event.id })}>
                  <View style={styles.taskItem}>
                    <Text style={styles.taskText}>Title: {event.title || 'No title'}</Text>
                    <Text style={styles.taskText}>Location: {event.location || 'No location'}</Text>
                    <Text style={styles.taskText}>Start: {event.startTime ? new Date(event.startTime.toDate()).toLocaleString() : 'No start time'}</Text>
                    <Text style={styles.taskText}>End: {event.endTime ? new Date(event.endTime.toDate()).toLocaleString() : 'No end time'}</Text>
                    <Text style={styles.taskText}>All Day: {event.allDay ? 'Yes' : 'No'}</Text>
                    <Text style={styles.taskText}>Repeat: {event.repeat ? 'Yes' : 'No'}</Text>
                    {event.repeat && <Text style={styles.taskText}>Repeat Interval: {event.repeatInterval || 'No interval'}</Text>}
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
    backgroundColor: '#03012E',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#03012E',
    paddingBottom: 20,
  },
  headerContainer: {
    paddingTop: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    color: '#fff',
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 110,
    alignSelf: 'center',
    marginVertical: 20,
  },
  card: {
    borderRadius: 500,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCard: {
    width: '90%',
    height: '14%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  iconCard: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateTimeContainer: {
    alignItems: 'center',
  },
  date: {
    color: '#03012E',
    fontSize: 30,
    fontWeight: 'bold',
  },
  day: {
    color: '#03012E',
    fontSize: 18,
  },
  mytasksText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tasksContainer: {
    width: '90%',
    alignItems: 'center',
  },
  taskItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 400,
  },
  taskText: {
    color: 'black',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default HomeScreen;
