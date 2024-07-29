import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeContext } from '../navigation/AppNavigator';
import TaskScreen from '../screens/TaskScreen';
import { firestore, auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import { fetchAndScheduleTasks } from '../components/taskUtils';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  getAllKeys: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

// Mock navigation
const navigation = { navigate: jest.fn(), dispatch: jest.fn() };

describe('TaskScreen', () => {
  const theme = { colors: { background: 'white', text: 'black', placeholder: 'gray', primary: 'blue', buttonText: 'white', card: 'lightgray' } };
  
  it('should render correctly and display theme', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TaskScreen route={{ params: { userId: '123', scheduleId: '456' } }} navigation={navigation} />
      </ThemeContext.Provider>
    );

    expect(getByText('Create Task')).toBeTruthy();
  });

  it('should save draft task and navigate to Home', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce();
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: true });

    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TaskScreen route={{ params: { userId: '123', scheduleId: '456' } }} navigation={navigation} />
      </ThemeContext.Provider>
    );

    fireEvent.changeText(getByText('Title'), 'Test Task');
    fireEvent.press(getByText('Save Task'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('draftTask-123-456', expect.any(String));
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('should handle network failure by saving draft task', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce();
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TaskScreen route={{ params: { userId: '123', scheduleId: '456' } }} navigation={navigation} />
      </ThemeContext.Provider>
    );

    fireEvent.changeText(getByText('Title'), 'Test Task');
    fireEvent.press(getByText('Save Task'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('draftTask-123-456', expect.any(String));
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });
});
