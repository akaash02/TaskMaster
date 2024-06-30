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
import ViewTaskScreen from '../screens/ViewTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import EventScreen from '../screens/EventScreen';
import ViewEventScreen from '../screens/ViewEventScreen';
import TimeSlotScreen from '../screens/TimeSlotScreen';
import AddTimeSlotScreen from '../screens/AddTimeSlotScreen';
import { darkTheme, lightTheme } from '../themes/ThemeIndex';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            <Stack.Screen name="ViewTask" component={ViewTaskScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Event" component={EventScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ViewEvent" component={ViewEventScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TimeSlot" component={TimeSlotScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AddTimeSlot" component={AddTimeSlotScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
}

export default AppNavigator;
