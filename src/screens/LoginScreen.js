import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../config/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileData = await getUserProfile(user.uid);
        console.log('Fetched user profile data:', profileData);
        setUserName(profileData.name || '');
        navigation.replace('Home');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const createUserProfile = async (user) => {
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        name: userName,
        email: user.email,
        profilePicture: '',
        friends: [],
        analytics: {
          timeSpentOnTasks: {},
          productiveHours: 0,
          breaksTaken: 0,
          averageCompletionTime: 0,
        },
      });
      console.log('User profile created in Firestore!');
    } catch (error) {
      console.error('Error creating user profile: ', error.message);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        console.log('User profile data: ', userDoc.data());
        return userDoc.data();
      } else {
        console.log('No user profile found!');
        return {};
      }
    } catch (error) {
      console.error('Error getting user profile: ', error.message);
      return {};
    }
  };

  const handleAuthentication = async () => {
    try {
      if (user) {
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await createUserProfile(userCredential.user);
          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      switch (error.code) {
        case 'auth/wrong-password':
          alert('Incorrect password. Please try again.');
          break;
        case 'auth/user-not-found':
          alert('This email is not registered. Please create an account.');
          break;
        default:
          alert('Authentication failed. Please try again.');
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Please check your email.');
    } catch (error) {
      console.error('Password reset error:', error.message);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../../assets/main_logo.png')}
        style={styles.logo}
      />
      {user ? (
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <Button title="Logout" onPress={handleAuthentication} color="#e74c3c" />
        </View>
      ) : (
        <View style={styles.authContainer}>
          <Text style={[styles.title, styles.whiteText]}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            placeholderTextColor="#ffffff"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#ffffff"
          />
          {!isLogin && (
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Name"
              placeholderTextColor="#ffffff"
            />
          )}
          {isLogin && (
            <View style={styles.buttonContainer}>
              <Button title="Forgot Password?" onPress={handlePasswordReset} color="#e74c3c" />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
          </View>
          <View style={styles.bottomContainer}>
            <Text style={[styles.toggleText, styles.whiteText]} onPress={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#03012E',
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    color: '#ffffff',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
  },
  bottomContainer: {
    marginTop: 20,
  },
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 170,
    alignSelf: 'center',
    marginVertical: 20,
  },
  whiteText: {
    color: '#ffffff',
  },
});

export default LoginScreen;