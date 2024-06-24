import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

enableScreens();

const App = () => {
  return <AppNavigator />;
};

export default App;
