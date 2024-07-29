import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';

describe('LoginScreen component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<LoginScreen />);
    
    // Test that the component renders without crashing
    const loginScreen = getByTestId('LoginScreen');
    expect(loginScreen).toBeDefined();
  });

  it('displays sign in form when user is not logged in', () => {
    const { getByTestId, queryByTestId } = render(<LoginScreen />);
    
    // Test that sign in form elements are displayed
    expect(getByTestId('AuthContainer')).toBeDefined();
    expect(getByTestId('EmailInput')).toBeDefined();
    expect(getByTestId('PasswordInput')).toBeDefined();
    expect(getByTestId('SignInButton')).toBeDefined();
    expect(queryByTestId('ForgotPasswordButton')).toBeNull(); // Confirm it's not rendered initially
  });

  it('switches to sign up form when "Need an account? Sign Up" is pressed', () => {
    const { getByTestId } = render(<LoginScreen />);
    
    fireEvent.press(getByTestId('ToggleText'));
    
    expect(getByTestId('AuthContainer')).toBeDefined();
    expect(getByTestId('EmailInput')).toBeDefined();
    expect(getByTestId('PasswordInput')).toBeDefined();
    expect(getByTestId('SignUpButton')).toBeDefined();
    expect(getByTestId('NameInput')).toBeDefined();
  });

  it('calls handleAuthentication when sign in button is pressed', () => {
    const { getByTestId } = render(<LoginScreen />);
    const handleAuthentication = jest.fn();
    
    jest.spyOn(LoginScreen.prototype, 'handleAuthentication').mockImplementation(handleAuthentication);

    fireEvent.press(getByTestId('SignInButton'));
    
    expect(handleAuthentication).toHaveBeenCalled();
  });
ons
});
