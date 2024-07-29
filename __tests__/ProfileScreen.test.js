import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';
import { ThemeContext } from '../navigation/AppNavigator';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import NavBar from '../components/NavBar';

// Mocking the necessary imports and hooks
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

jest.mock('../components/NavBar', () => 'NavBar');

const theme = {
  dark: false,
  colors: {
    background: '#fff',
    text: '#000',
    primary: '#6200ee',
    card: '#f8f8f8',
    border: '#ddd',
  },
};

const lightTheme = {
  dark: false,
  colors: {
    background: '#fff',
    text: '#000',
    primary: '#6200ee',
    card: '#f8f8f8',
    border: '#ddd',
  },
};

const darkTheme = {
  dark: true,
  colors: {
    background: '#000',
    text: '#fff',
    primary: '#6200ee',
    card: '#333',
    border: '#555',
  },
};

describe('ProfileScreen Component', () => {
  const mockNavigation = { navigate: jest.fn(), replace: jest.fn() };
  const mockSetTheme = jest.fn();
  const mockSaveThemePreference = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders correctly and shows profile options', () => {
    const { getByText, getByRole } = render(
      <ThemeContext.Provider value={{ theme, setTheme: mockSetTheme, saveThemePreference: mockSaveThemePreference }}>
        <ProfileScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    // Check for header text and buttons
    expect(getByText('My Profile')).toBeTruthy();
    expect(getByText('Free time slots')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
    expect(getByText('Delete Profile')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Please log out and log in again if dark mode is not rendering properly.')).toBeTruthy();
    expect(getByText('Sleep')).toBeTruthy();
    expect(getByText('Analytics')).toBeTruthy();

    // Check for Switch component
    expect(getByRole('switch')).toBeTruthy();
  });

  test('navigates to TimeSlot screen on button press', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: mockSetTheme, saveThemePreference: mockSaveThemePreference }}>
        <ProfileScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Free time slots'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('TimeSlot');
  });

  test('logs out user on button press', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: mockSetTheme, saveThemePreference: mockSaveThemePreference }}>
        <ProfileScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(expect.anything());
      expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
    });
  });

  test('shows confirmation dialog and deletes profile', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme, setTheme: mockSetTheme, saveThemePreference: mockSaveThemePreference }}>
        <ProfileScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Delete Profile'));

    // Simulate pressing 'Delete' in the alert
    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalledWith(doc(expect.anything(), 'users', 'test-user-id'));
      expect(deleteUser).toHaveBeenCalledWith(expect.anything());
      expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
    });
  });

  test('toggles theme on switch press', () => {
    const { getByRole } = render(
      <ThemeContext.Provider value={{ theme, setTheme: mockSetTheme, saveThemePreference: mockSaveThemePreference }}>
        <ProfileScreen navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    const switchElement = getByRole('switch');
    fireEvent.valueChange(switchElement, true);

    expect(mockSetTheme).toHaveBeenCalledWith(darkTheme);
    expect(mockSaveThemePreference).toHaveBeenCalledWith('dark');
  });

  test('shows error if theme context is not available', () => {
    const { getByText } = render(
      <ProfileScreen navigation={mockNavigation} />
    );

    // Check for error message if no theme is provided
    expect(getByText('Theme context is not available.')).toBeTruthy();
  });
});
