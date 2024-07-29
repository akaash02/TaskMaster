import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NavBar from '../components/NavBar';
import { ThemeContext } from '../navigation/AppNavigator';

const mockNavigate = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
};

const theme = {
  colors: {
    card: 'white',
    text: 'black',
  },
};

describe('NavBar', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <NavBar navigation={mockNavigation} userId="user123" scheduleId="schedule456" />
      </ThemeContext.Provider>
    );

    expect(getByTestId('home-icon')).toBeTruthy();
    expect(getByTestId('calendar-icon')).toBeTruthy();
    expect(getByTestId('friends-icon')).toBeTruthy();
    expect(getByTestId('profile-icon')).toBeTruthy();
  });

  it('should navigate to Home when home icon is pressed', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <NavBar navigation={mockNavigation} userId="user123" scheduleId="schedule456" />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('home-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('should navigate to Calendar with userId and scheduleId when calendar icon is pressed', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <NavBar navigation={mockNavigation} userId="user123" scheduleId="schedule456" />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('calendar-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('Calendar', { userId: 'user123', scheduleId: 'schedule456' });
  });

  it('should navigate to Friends when friends icon is pressed', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <NavBar navigation={mockNavigation} userId="user123" scheduleId="schedule456" />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('friends-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('Friends');
  });

  it('should navigate to Profile when profile icon is pressed', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <NavBar navigation={mockNavigation} userId="user123" scheduleId="schedule456" />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('profile-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });
});
