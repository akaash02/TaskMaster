import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FriendsScreen from '../screens/FriendsScreen';
import TaskScreen from '../screens/TaskScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Task" component={TaskScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
