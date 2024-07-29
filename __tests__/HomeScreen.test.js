import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

describe('HomeScreen component', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    const homeScreen = getByTestId('HomeScreen');
    expect(homeScreen).toBeDefined();
  });

  it('renders loading text when tasks and events are loading', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    const loadingText = getByTestId('LoadingText');
    expect(loadingText).toBeDefined();
    expect(loadingText).toHaveTextContent('Loading...');
  });

  it('navigates to Task screen when Task option is selected', () => {
    const navigationMock = {
      navigate: jest.fn()
    };
    const { getByTestId } = render(<HomeScreen navigation={navigationMock} />);
    
    const taskDropdown = getByTestId('CircularDropdown');
    fireEvent.press(taskDropdown);
    fireEvent.press(getByTestId('TaskButton'));

    expect(navigationMock.navigate).toHaveBeenCalledWith('Task', { userId: '', scheduleId: 'yourScheduleId' });
  });

});
