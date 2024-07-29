import '@testing-library/jest-native/extend-expect';
import '@testing-library/jest-native/extend-expect';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native-elements');
jest.mock('react-native-calendars');
jest.mock('react-native-modal-datetime-picker');
jest.mock('@react-native-community/datetimepicker');
jest.mock('react-native-gesture-handler');
jest.mock('react-native-chart-kit');
jest.mock('react-native-picker-select');

jest.mock('../../tensorflowModel', () => ({
  createModel: jest.fn(),
  trainModel: jest.fn(),
  predictSingle: jest.fn(),
}));

jest.mock('../../prepareData', () => ({
  prepareData: jest.fn(),
}));

jest.mock('@tensorflow/tfjs', () => ({
  tensor: jest.fn(),
  tidy: jest.fn(),
  sequential: jest.fn(),
  layers: {
    dense: jest.fn(),
    activation: jest.fn(),
    dropout: jest.fn(),
  },
  train: {
    sgd: jest.fn(),
  },
  optimizer: jest.fn(),
}));

jest.mock('@tensorflow/tfjs', () => {
  return {
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
  };
});

// Navigation mocks
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: jest.fn().mockImplementation(({ children }) => children),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn().mockImplementation(() => ({
    Navigator: jest.fn().mockImplementation(({ children }) => children),
    Screen: jest.fn().mockImplementation(({ children }) => children),
  })),
}));
