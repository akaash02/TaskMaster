import React from 'react';
import { View, StyleSheet, Button, Alert, TouchableOpacity, Text } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { auth, firestore } from '../config/firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
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

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'My Profile', style: styles.headerText }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteProfile}>
          <Text style={styles.buttonText}>Delete Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <Icon
          name='home'
          type='material'
          onPress={() => navigation.navigate('Home')}
          size={30}
          color="#03012E"
        />
        <Icon
          name='calendar-today'
          type='material'
          onPress={() => navigation.navigate('Calendar', { userId: 'yourUserId', scheduleId: 'yourScheduleId' })}
          size={30}
          color="#03012E"
        />
        <Icon
          name='people'
          type='material'
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color="#03012E"
        />
        <Icon
          name='person'
          type='material'
          onPress={() => navigation.navigate('Profile')}
          size={30}
          color="#03012E"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03012E',
  },
  headerContainer: {
    paddingTop: 40,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerText: {
    color: '#fff',
    fontSize: 30,
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
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#6aa8f2',
    paddingVertical: 10,
  },
});

export default ProfileScreen;
