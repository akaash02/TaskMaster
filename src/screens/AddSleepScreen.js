import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore, auth } from '../config/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';

const AddSleepScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [quality, setQuality] = useState('');
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Sleep Data',
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: theme.colors.text,
    });
  }, [navigation, theme]);

  const handleSaveSleep = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const sleepData = {
          startTime: Timestamp.fromDate(startTime),
          endTime: Timestamp.fromDate(endTime),
          quality: parseInt(quality),
        };

        await addDoc(collection(firestore, 'users', user.uid, 'sleepData'), sleepData);
        Alert.alert('Success', 'Sleep data added successfully.');
        navigation.goBack();
      } catch (error) {
        console.error('Error adding sleep data: ', error);
        Alert.alert('Error', 'Failed to add sleep data. Please try again.');
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleStartTimeConfirm = (selectedTime) => {
    setStartTime(selectedTime);
    setStartTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (selectedTime) => {
    setEndTime(selectedTime);
    setEndTimePickerVisibility(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text h4 style={[styles.title, { color: theme.colors.text }]}>Add Sleep Data</Text>
      
      <TouchableOpacity onPress={() => setStartTimePickerVisibility(true)}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {startTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="datetime"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setStartTimePickerVisibility(false)}
      />

      <TouchableOpacity onPress={() => setEndTimePickerVisibility(true)}>
        <Text style={[styles.input, { color: theme.colors.text }]}>
          {endTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="datetime"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setEndTimePickerVisibility(false)}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
        keyboardType="numeric"
        placeholder="Quality (1-10)"
        value={quality}
        onChangeText={setQuality}
      />

      <Button
        title="Save Sleep Data"
        onPress={handleSaveSleep}
        buttonStyle={[styles.button, { backgroundColor: theme.colors.card }]}
        titleStyle={{ color: theme.colors.text }}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Sleep')} style={[styles.addButton, { backgroundColor: theme.colors.text }]}>
      <Text style={[styles.buttonText, { color: theme.colors.background }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
  },
  button: {
    padding: 16,
    borderRadius: 4,
    marginVertical: 8,
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default AddSleepScreen;
