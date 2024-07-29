import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeContext } from '../navigation/AppNavigator';
import CalendarScreen from '../screens/CalendarScreen';
import { firestore } from '../config/firebaseConfig';

const theme = {
  colors: {
    background: 'white',
    text: 'black',
    primary: 'blue',
    card: 'lightgrey',
  },
};

const mockNavigation = {
  navigate: jest.fn(),
};

describe('CalendarScreen', () => {
  beforeEach(() => {
    firestore.collection.mockClear();
    firestore.doc.mockClear();
    firestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ exists: jest.fn().mockReturnValue(true) }),
      add: jest.fn().mockResolvedValue(),
      where: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnThis(),
      getDocs: jest.fn().mockResolvedValue({ empty: true }),
      onSnapshot: jest.fn().mockReturnThis(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CalendarScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    expect(getByTestId('calendar-header')).toBeTruthy();
    expect(getByTestId('calendar')).toBeTruthy();
    expect(getByTestId('loading-text')).toBeTruthy();
  });

  it('handles day press on calendar', async () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <CalendarScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    const calendar = getByTestId('calendar');
    fireEvent(calendar, 'dayPress', { timestamp: 1625904000000 }); // Replace with your specific timestamp

    await waitFor(() => {
      expect(firestore.collection).toHaveBeenCalled();
      expect(firestore.collection().where().onSnapshot).toHaveBeenCalled();
    });
  });
});
