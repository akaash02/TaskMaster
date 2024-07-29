import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AnalyticsScreen from './AnalyticsScreen';
import { ThemeContext } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';

// Mocking the necessary imports and hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@tensorflow/tfjs', () => ({
  backend: jest.fn(),
}));

const theme = {
  colors: {
    background: '#fff',
    text: '#000',
    primary: '#6200ee',
    card: '#f8f8f8',
  },
};

describe('AnalyticsScreen Component', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    useNavigation.mockReturnValue(mockNavigation);
  });

  test('renders all charts and buttons correctly', () => {
    const { getByText, getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AnalyticsScreen />
      </ThemeContext.Provider>
    );

    // Check for the presence of chart titles
    expect(getByText('Current Tasks Overview')).toBeTruthy();
    expect(getByText('Overall Overview')).toBeTruthy();
    expect(getByText('Tasks Heatmap')).toBeTruthy();
    expect(getByText('Sleep Hours per Month')).toBeTruthy();
    expect(getByText('Sleep Heatmap')).toBeTruthy();

    // Check for the presence of the back button
    expect(getByText('Back')).toBeTruthy();
  });

  test('navigates back when back button is pressed', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AnalyticsScreen />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByText('Back'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
  });

  test('changes chart on picker selection', async () => {
    const { getByText, getByTestId } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AnalyticsScreen />
      </ThemeContext.Provider>
    );

    // Check initial chart
    expect(getByText('Current Tasks Overview')).toBeTruthy();

    // Change the picker value to 'hours'
    fireEvent(valueChange, getByTestId('picker'), 'hours');

    await waitFor(() => {
      expect(getByText('No. of hours spent on tasks / month')).toBeTruthy();
    });
  });

  test('displays heatmap correctly', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={{ theme }}>
        <AnalyticsScreen />
      </ThemeContext.Provider>
    );

    // Check for heatmap sections
    expect(getByText('Tasks Heatmap')).toBeTruthy();
    expect(getByText('Sleep Heatmap')).toBeTruthy();
  });
});
