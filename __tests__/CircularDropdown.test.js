import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CircularDropdown from '../CircularDropdown';
import { ThemeContext } from '../../navigation/AppNavigator';

const mockTheme = {
  colors: {
    card: '#fff',
    text: '#000',
    background: '#eee'
  }
};

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' }
];

const mockOnSelect = jest.fn();

describe('CircularDropdown', () => {
  it('renders correctly and handles selection', () => {
    const { getByRole, getByText, queryByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <CircularDropdown icon="menu" options={mockOptions} onSelect={mockOnSelect} />
      </ThemeContext.Provider>
    );

    const button = getByRole('button');
    fireEvent.press(button);

    expect(queryByText('Option 1')).toBeTruthy();
    expect(queryByText('Option 2')).toBeTruthy();

    const option1 = getByText('Option 1');
    fireEvent.press(option1);

    expect(mockOnSelect).toHaveBeenCalledWith({ value: '1', label: 'Option 1' });
  });

  it('closes modal on back button press', () => {
    const { getByRole, getByText, queryByText } = render(
      <ThemeContext.Provider value={{ theme: mockTheme }}>
        <CircularDropdown icon="menu" options={mockOptions} onSelect={mockOnSelect} />
      </ThemeContext.Provider>
    );

    const button = getByRole('button');
    fireEvent.press(button);

    const backButton = getByText('Back');
    fireEvent.press(backButton);

    expect(queryByText('Option 1')).toBeFalsy();
    expect(queryByText('Option 2')).toBeFalsy();
  });
});
