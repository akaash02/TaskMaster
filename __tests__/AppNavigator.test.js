import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppNavigator from '../AppNavigator'; 
import { ThemeContext } from '../navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebaseConfig';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  auth: { currentUser: { uid: 'testUserId' } },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => <>{children}</>,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => <>{children}</>,
    Screen: () => null,
  }),
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and sets theme based on user data', async () => {
    
    getDoc.mockResolvedValueOnce({
      exists: jest.fn(() => true),
      data: jest.fn(() => ({ theme: 'dark' })),
    });
    
    const { findByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getDoc).toHaveBeenCalledWith(doc(firestore, 'users', 'testUserId'));
      
      expect(findByText('Login')).toBeTruthy(); 
    });
  });

  it('should call saveThemePreference when theme changes', async () => {
    const saveThemePreference = jest.fn();
    const setTheme = jest.fn();
    const themeContextValue = { theme: 'light', setTheme, saveThemePreference };

  
    setDoc.mockResolvedValueOnce();

    render(
      <ThemeContext.Provider value={themeContextValue}>
        <AppNavigator />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        doc(firestore, 'users', 'testUserId'),
        { theme: 'light' },
        { merge: true }
      );
    });
  });
});
