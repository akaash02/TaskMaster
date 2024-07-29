import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FriendsScreen from '../FriendsScreen'; 
import { ThemeContext } from '../navigation/AppNavigator';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebaseConfig';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  auth: { currentUser: { uid: 'testUserId' } },
}));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));
jest.mock('../config/firebaseConfig', () => ({
  auth: { currentUser: { uid: 'testUserId' } },
  firestore: {},
}));

const mockTheme = {
  colors: {
    background: 'white',
    text: 'black',
    card: 'gray',
    border: 'black',
  },
};

describe('FriendsScreen', () => {
  it('renders correctly with the theme context', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const { getByPlaceholderText, getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <FriendsScreen navigation={{ navigate: jest.fn() }} />
      </ThemeContext.Provider>
    );

    expect(getByPlaceholderText('Search for friends')).toBeTruthy();
    expect(getByText('My Friends')).toBeTruthy();
  });

  it('searches and displays search results', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const searchResults = [
      { id: 'user1', data: () => ({ name: 'Friend 1', userId: 'user1' }) },
      { id: 'user2', data: () => ({ name: 'Friend 2', userId: 'user2' }) },
    ];

    getDocs.mockResolvedValueOnce({
      docs: searchResults,
    });

    const { getByPlaceholderText, getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <FriendsScreen navigation={{ navigate: jest.fn() }} />
      </ThemeContext.Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Search for friends'), 'Friend');
    fireEvent(getByPlaceholderText('Search for friends'), 'onSubmitEditing');

    await waitFor(() => {
      expect(getByText('Friend 1')).toBeTruthy();
      expect(getByText('Friend 2')).toBeTruthy();
    });
  });

  it('adds a friend and displays in friends list', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [],
    });

    const newFriend = { userId: 'user1', name: 'New Friend' };

    const { getByPlaceholderText, getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <FriendsScreen navigation={{ navigate: jest.fn() }} />
      </ThemeContext.Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Search for friends'), 'New Friend');
    fireEvent(getByPlaceholderText('Search for friends'), 'onSubmitEditing');

    await waitFor(() => {
      expect(getByText('New Friend')).toBeTruthy();
    });

    fireEvent.press(getByText('New Friend'));

    await waitFor(() => {
      expect(getByText('My Friends')).toBeTruthy();
      expect(getByText('New Friend')).toBeTruthy();
    });
  });

  it('deletes a friend from the list', async () => {
    const friends = [
      { userId: 'user1', name: 'Friend 1' },
      { userId: 'user2', name: 'Friend 2' },
    ];

    getDocs.mockResolvedValueOnce({
      docs: friends.map(friend => ({
        id: friend.userId,
        data: () => friend,
      })),
    });

    const { getByText, queryByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <FriendsScreen navigation={{ navigate: jest.fn() }} />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Friend 1')).toBeTruthy();
      expect(getByText('Friend 2')).toBeTruthy();
    });

    fireEvent.press(getByText('Friend 1').parentElement.querySelector('delete-icon'));

    await waitFor(() => {
      expect(queryByText('Friend 1')).toBeNull();
      expect(getByText('Friend 2')).toBeTruthy();
    });
  });

  it('navigates to chat screen when a friend is selected', async () => {
    const friends = [
      { userId: 'user1', name: 'Friend 1' },
    ];

    getDocs.mockResolvedValueOnce({
      docs: friends.map(friend => ({
        id: friend.userId,
        data: () => friend,
      })),
    });

    const mockNavigate = jest.fn();

    const { getByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <FriendsScreen navigation={{ navigate: mockNavigate }} />
      </ThemeContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Friend 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Friend 1'));

    expect(mockNavigate).toHaveBeenCalledWith('Chat', { chatId: 'testUserId_user1', friendName: 'Friend 1' });
  });
});
