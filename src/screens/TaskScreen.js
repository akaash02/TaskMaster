import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Icon, Card, Button } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const TaskScreen = ({ navigation }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [pickerType, setPickerType] = useState(null);

  const showDatePicker = (type) => {
    setPickerType(type);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showTimePicker = (type) => {
    setPickerType(type);
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    if (pickerType === 'start') {
      setSelectedStartDate(date);
    } else {
      setSelectedEndDate(date);
    }
    hideDatePicker();
  };

  const handleConfirmTime = (time) => {
    if (pickerType === 'start') {
      setSelectedStartTime(time);
    } else {
      setSelectedEndTime(time);
    }
    hideTimePicker();
  };

  const handleSave = () => {
    // Logic to save the task
    console.log('Task Saved:', {
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
    });
    navigation.navigate('Home');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => showDatePicker('start')}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Start Date: {selectedStartDate ? selectedStartDate.toLocaleDateString() : 'Select Start Date'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => showDatePicker('end')}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>End Date: {selectedEndDate ? selectedEndDate.toLocaleDateString() : 'Select End Date'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => showTimePicker('start')}>
              <View style={styles.cardContent}>
                <Icon name="access-time" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Start Time: {selectedStartTime ? selectedStartTime.toLocaleTimeString() : 'Select Start Time'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.standardCard]}>
            <TouchableOpacity onPress={() => showTimePicker('end')}>
              <View style={styles.cardContent}>
                <Icon name="access-time" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>End Time: {selectedEndTime ? selectedEndTime.toLocaleTimeString() : 'Select End Time'}</Text>
              </View>
            </TouchableOpacity>
          </Card>
          <Card containerStyle={[styles.card, styles.saveCard]}>
            <TouchableOpacity onPress={handleSave}>
              <View style={styles.cardContent}>
                <Icon name="save" type="material" size={27} color="#FFFFFF" />
                <Text style={styles.saveCardTitle}>Save</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
        />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirmTime}
          onCancel={hideTimePicker}
        />
      </View>
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
          onPress={() => navigation.navigate('Calendar')}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#03012E',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  saveCard: {
    backgroundColor: '#6aa8f2',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 31,
    color: '#03012E',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  saveCardTitle: {
    fontSize: 31,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
});

export default TaskScreen;
