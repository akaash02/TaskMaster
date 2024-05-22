import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header, Icon, Text } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = ({ navigation }) => {
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
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarHeaderText}>My Events</Text>
          </View>
          <Calendar
            // Customize the calendar theme
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
              textDayHeaderFontSize: 16
            }}
          />
        </View>
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksHeaderText}>My Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Task')}>
              <View style={styles.addTaskButton}>
                <Text style={styles.addTaskButtonText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
          {}
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <Icon
          name='home'
          type='material'
          onPress={() => navigation.navigate('Home')}
          size={30}
          color="#03012E"
        />
        <Icon
          name='calendar-today'
          type='material'
          onPress={() => navigation.navigate('Calendar')}
          size={30}
          color="#03012E"
        />
        <Icon
          name='people'
          type='material'
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color="#03012E"
        />
        <Icon
          name='person'
          type='material'
          onPress={() => console.log('Profile Pressed')}
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
    fontSize: 30,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  calendarHeader: {
    marginBottom: 20,
  },
  calendarHeaderText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  tasksContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tasksHeaderText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  addTaskButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  addTaskButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
});

export default CalendarScreen;
