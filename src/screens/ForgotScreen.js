import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Please check your email.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Password reset error:', error.message);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={[styles.title, styles.whiteText]}>Forgot Password</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          placeholderTextColor="#ffffff"
        />
        <View style={styles.buttonContainer}>
          <Button title="Reset Password" onPress={handlePasswordReset} color="#3498db" />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Back to Login" onPress={() => navigation.goBack()} color="#3498db" />
        </View>
      </View>
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
  whiteText: {
    color: '#ffffff',
  },
});

export default ForgotScreen;
