import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SleepScreen from '../SleepScreen'; 
import '@tensorflow/tfjs'; 

jest.mock('@tensorflow/tfjs', () => ({
  tensor2d: jest.fn(() => ({
    arraySync: jest.fn(() => []),
    dispose: jest.fn(),
  })),
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve({ history: { history: [] } })),
    predict: jest.fn(() => ({
      arraySync: jest.fn(() => [0]),
    })),
  })),
  train: {
    adam: jest.fn(),
  },
  layers: {
    dense: jest.fn(),
  },
  ready: jest.fn(() => Promise.resolve()),
}));

describe('SleepScreen', () => {
  test('renders correctly and interacts with the UI', async () => {
    const { getByText, getByTestId } = render(<SleepScreen />);

    
    expect(getByText('Sleep')).toBeTruthy();

    
    fireEvent.press(getByText('Generate Model'));

   
    await waitFor(() => {
      expect(getByText('Optimal Sleep Schedule')).toBeTruthy();
    });
  });
});
