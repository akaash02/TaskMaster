import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditTaskScreen from './EditTaskScreen';

describe('EditTaskScreen Component', () => {
  test('renders all input fields correctly', () => {
    const { getByTestId } = render(<EditTaskScreen route={{ params: { userId: 'user123', scheduleId: 'schedule123', taskId: 'task123' } }} />);

    expect(getByTestId('titleInput')).toBeTruthy();
    expect(getByTestId('durationInput')).toBeTruthy();
    expect(getByTestId('difficultyInput')).toBeTruthy();
    expect(getByTestId('priorityInput')).toBeTruthy();
    expect(getByTestId('deadlineInput')).toBeTruthy();
    expect(getByTestId('startTimeInput')).toBeTruthy();
    expect(getByTestId('endTimeInput')).toBeTruthy();
  });

  test('saves task when save button is pressed', async () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = render(<EditTaskScreen route={{ params: { userId: 'user123', scheduleId: 'schedule123', taskId: 'task123' } }} navigation={mockNavigation} />);

    fireEvent.changeText(getByTestId('titleInput'), 'Updated Task Title');
    fireEvent.changeText(getByTestId('durationInput'), '2 hours');
    fireEvent.changeText(getByTestId('difficultyInput'), '3');
    fireEvent.changeText(getByTestId('priorityInput'), 'High');
    fireEvent.changeText(getByTestId('deadlineInput'), '2024-07-10');
    fireEvent.changeText(getByTestId('startTimeInput'), '10:00 AM');
    fireEvent.changeText(getByTestId('endTimeInput'), '12:00 PM');

    fireEvent.press(getByTestId('saveTaskButton'));

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  test('navigates to Home screen when home button is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    const { getByTestId } = render(<EditTaskScreen route={{ params: { userId: 'user123', scheduleId: 'schedule123', taskId: 'task123' } }} navigation={mockNavigation} />);

    fireEvent.press(getByTestId('homeButton'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
  });
});
