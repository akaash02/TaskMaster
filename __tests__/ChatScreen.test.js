import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ChatScreen from './ChatScreen';
import { ThemeContext } from '../navigation/AppNavigator';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore, auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

// Mocking the necessary imports and hooks
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
}));

jest.mock('../config/firebaseConfig', () => ({
  firestore: {},
  auth: {
    currentUser: {
      uid: 'test-user-id',
    },
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const theme = {
  colors: {
    background: '#fff',
    text: '#000',
    primary: '#6200ee',
    card: '#f8f8f8',
    border: '#ddd',
  },
};

describe('ChatScreen Component', () => {
  const mockNavigation = { goBack: jest.fn() };
  const route = { params: { chatId: 'test-chat-id', friendName: 'Friend' } };

  beforeEach(() => {
    // Mock the Firestore onSnapshot method to simulate real-time updates
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: [
          {
            id: '1',
            data: () => ({
              text: 'Hello!',
              createdAt: new Date(),
              userId: 'test-user-id',
            }),
          },
        ],
      });
      return jest.fn();
    });
  });

  test('renders correctly and shows messages', async () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <ChatScreen route={route} navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    // Check for header text and placeholder
    expect(getByText('Friend')).toBeTruthy();
    expect(getByPlaceholderText('Type a message...')).toBeTruthy();

    // Wait for the message to be displayed
    await waitFor(() => {
      expect(getByText('Hello!')).toBeTruthy();
    });
  });

  test('navigates back when back button is pressed', () => {
    const { getByRole } = render(
      <ThemeContext.Provider value={{ theme }}>
        <ChatScreen route={route} navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByRole('button'));

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('sends a new message', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <ChatScreen route={route} navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    // Simulate typing a new message
    fireEvent.changeText(getByPlaceholderText('Type a message...'), 'Test message');
    fireEvent.press(getByText('Send'));

    // Ensure addDoc was called with the new message
    expect(addDoc).toHaveBeenCalledWith(collection(firestore, 'chats', 'test-chat-id', 'messages'), {
      text: 'Test message',
      createdAt: expect.any(Date),
      userId: 'test-user-id',
    });
  });

  test('shows error if theme context is not available', () => {
    const { getByText } = render(
      <ChatScreen route={route} navigation={mockNavigation} />
    );

    // Check for error message if no theme is provided
    expect(getByText('Theme context is not available.')).toBeTruthy();
  });
});
