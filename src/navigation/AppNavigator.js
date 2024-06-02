// /src/navigation/AppNavigator.js

import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebaseConfig';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FriendsScreen from '../screens/FriendsScreen';
import TaskScreen from '../screens/TaskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotScreen from '../screens/ForgotScreen';
import ViewScreen from '../screens/ViewScreen';
import EventScreen from '../screens/EventScreen';
import ViewEventScreen from '../screens/ViewEventScreen';
import { darkTheme, lightTheme } from '../themes';

const Stack = createStackNavigator();
export const ThemeContext = createContext();

function AppNavigator() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTheme(userData.theme === 'dark' ? darkTheme : lightTheme);
        } else {
          // If no user doc exists, create one with default theme
          await setDoc(doc(firestore, 'users', user.uid), { theme: 'light' });
          setTheme(lightTheme);
        }
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const saveThemePreference = async (themePreference) => {
    if (user) {
      await setDoc(doc(firestore, 'users', user.uid), { theme: themePreference }, { merge: true });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveThemePreference }}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Forgot" component={ForgotScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Task" component={TaskScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="View" component={ViewScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Event" component={EventScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ViewEvent" component={ViewEventScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

export default AppNavigator;
