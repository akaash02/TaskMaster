import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotScreen from '../ForgotScreen'; 
import { auth } from '../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('ForgotScreen', () => {
  it('renders correctly and handles password reset', async () => {
    sendPasswordResetEmail.mockResolvedValueOnce({});
    
    const { getByPlaceholderText, getByText } = render(
      <ForgotScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByText('Reset Password')).toBeTruthy();
    expect(getByText('Back to Login')).toBeTruthy();
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Reset Password'));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  it('shows error alert on password reset failure', async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('Failed to send email'));
    
    const { getByPlaceholderText, getByText } = render(
      <ForgotScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Reset Password'));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
    });
  });
});
