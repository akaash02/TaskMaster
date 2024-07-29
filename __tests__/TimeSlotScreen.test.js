import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeContext } from '../navigation/AppNavigator';
import TimeSlotScreen from '../screens/TimeSlotScreen';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { auth } from '../config/firebaseConfig';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock navigation
const navigation = { navigate: jest.fn() };

describe('TimeSlotScreen', () => {
  const theme = { colors: { background: 'white', text: 'black', card: 'lightgray' } };
  
  it('should render correctly and display theme', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TimeSlotScreen navigation={navigation} />
      </ThemeContext.Provider>
    );

    expect(getByText('Weekly Time Slots')).toBeTruthy();
  });

  it('should fetch and display time slots', async () => {
    const mockTimeSlots = [
      { id: '1', dayOfWeek: 'Monday', startTime: 480, endTime: 540, isCustom: false },
    ];

    collection.mockReturnValueOnce({ id: '123', data: () => mockTimeSlots });
    getDocs.mockResolvedValueOnce({ docs: mockTimeSlots.map(slot => ({ id: slot.id, data: () => slot })) });

    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TimeSlotScreen navigation={navigation} />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Monday: 08:00 AM - 09:00 AM')).toBeTruthy();
    });
  });

  it('should delete a time slot', async () => {
    deleteDoc.mockResolvedValueOnce();

    const mockTimeSlots = [
      { id: '1', dayOfWeek: 'Monday', startTime: 480, endTime: 540, isCustom: false },
    ];

    collection.mockReturnValueOnce({ id: '123', data: () => mockTimeSlots });
    getDocs.mockResolvedValueOnce({ docs: mockTimeSlots.map(slot => ({ id: slot.id, data: () => slot })) });

    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: jest.fn(), saveThemePreference: jest.fn() }}>
        <TimeSlotScreen navigation={navigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Delete')); // Adjust selector if necessary

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
