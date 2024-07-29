import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddSleepScreen from './AddSleepScreen';
import { ThemeContext } from '../navigation/AppNavigator';
import { auth } from '../config/firebaseConfig';
import { Timestamp } from 'firebase/firestore';

// Mock Firebase Authentication
jest.mock('../config/firebaseConfig', () => ({
  auth: {
    currentUser: { uid: 'user123' },
  },
  firestore: {},
}));

describe('AddSleepScreen Component', () => {
  test('renders all input fields and buttons correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={{ theme: { colors: { primary: 'blue', text: 'white', background: 'black', card: 'gray' } } }}>
        <AddSleepScreen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} />
      </ThemeContext.Provider>
    );

    expect(getByText('Add Sleep Data')).toBeTruthy();
    expect(getByPlaceholderText('Quality (1-10)')).toBeTruthy();
    expect(getByText('Save Sleep Data')).toBeTruthy();
    expect(getByText('Back')).toBeTruthy();
  });

  test('saves sleep data when save button is pressed', async () => {
    const mockNavigation = { goBack: jest.fn() };
    const mockAddDoc = jest.fn().mockResolvedValue({});
    jest.mock('firebase/firestore', () => ({
      collection: jest.fn(),
      addDoc: mockAddDoc,
      Timestamp: { fromDate: jest.fn(date => Timestamp.now()) },
    }));

    const { getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={{ theme: { colors: { primary: 'blue', text: 'white', background: 'black', card: 'gray' } } }}>
        <AddSleepScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Save Sleep Data'));

    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  test('navigates back to Sleep screen when back button is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme: { colors: { primary: 'blue', text: 'white', background: 'black', card: 'gray' } } }}>
        <AddSleepScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Back'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Sleep');
  });
});
