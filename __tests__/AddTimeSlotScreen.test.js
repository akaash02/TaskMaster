import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddTimeSlotScreen from '../screens/AddTimeSlotScreen';
import { ThemeContext } from '../navigation/AppNavigator';
import { auth, firestore } from '../config/firebaseConfig';
import { getDoc, doc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';

jest.mock('../config/firebaseConfig');
jest.mock('firebase/firestore');
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@react-native-picker/picker', () => {
  const { Picker } = jest.requireActual('@react-native-picker/picker');
  return { Picker };
});

const mockNavigate = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
};

const theme = {
  colors: {
    background:     'white',
    text: 'black',
    card: 'lightgrey',
  },
};

const mockRoute = {
  params: {
    userId: 'mockUserId',
  },
};

describe('AddTimeSlotScreen', () => {
  beforeEach(() => {
    firestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ exists: jest.fn().mockReturnValue(true) }),
      add: jest.fn().mockResolvedValue(),
      where: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnThis(),
      getDocs: jest.fn().mockResolvedValue({ empty: true }),
      some: jest.fn().mockReturnValue(false),
    });
    auth.currentUser = {
      uid: 'mockUserId',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AddTimeSlotScreen navigation={mockNavigation} route={mockRoute} />
      </ThemeContext.Provider>
    );

    expect(getByTestId('header-text')).toBeTruthy();
    expect(getByTestId('day-picker')).toBeTruthy();
    expect(getByTestId('start-time-label')).toBeTruthy();
    expect(getByTestId('end-time-label')).toBeTruthy();
    expect(getByTestId('add-time-slot-button')).toBeTruthy();
    expect(getByTestId('back-button')).toBeTruthy();
  });

  it('handles adding a time slot', async () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AddTimeSlotScreen navigation={mockNavigation} route={mockRoute} />
      </ThemeContext.Provider>
    );

    const addTimeSlotButton = getByTestId('add-time-slot-button');
    fireEvent.press(addTimeSlotButton);

    await waitFor(() => {
      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.collection().doc().set).toHaveBeenCalled();
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });
});

