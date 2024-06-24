// /src/screens/ProfileScreen.js

import React, { useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Switch } from 'react-native';
import { Header } from 'react-native-elements';
import { auth, firestore } from '../config/firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { ThemeContext } from '../navigation/AppNavigator';
import { darkTheme, lightTheme } from '../themes/iThemeIdex';
import NavBar from '../components/NavBar'; // Import the NavBar component

const ProfileScreen = ({ navigation }) => {
  const { theme, setTheme, saveThemePreference } = useContext(ThemeContext);
  const isDarkMode = theme.dark;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'No user is currently signed in.');
      return;
    }

    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, 'users', user.uid));
              await deleteUser(user);
              navigation.replace('Login');
            } catch (error) {
              console.error('Error deleting profile: ', error.message);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? lightTheme : darkTheme;
    setTheme(newTheme);
    saveThemePreference(newTheme.dark ? 'dark' : 'light');
    Alert.alert(
      'Theme Changed',
      'You have changed the theme. Please log out and log in again to apply the changes.',
      [
        {
          text: 'Log Out Now',
          onPress: handleLogout,
        },
        {
          text: 'Later',
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        centerComponent={{ text: 'My Profile', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <View style={styles.content}>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('TimeSlot')}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Free time slots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.card }]} onPress={handleLogout}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProfile}>
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>Delete Profile</Text>
        </TouchableOpacity>
        <View style={styles.switchContainer}>
          <Text style={{ color: theme.colors.text }}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
      <NavBar navigation={navigation} userId={'yourUserId'} scheduleId={'yourScheduleId'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff0000',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
});

export default ProfileScreen;
