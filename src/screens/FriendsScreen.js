import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Header, Text } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator'; // Ensure this path is correct
import NavBar from '../components/NavBar'; // Import the NavBar component

const FriendsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  // Debugging log
  console.log('ThemeContext in FriendsScreen:', theme);

  if (!theme) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Theme context is not available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        centerComponent={{ text: 'My Friends', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.background }]}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>You currently have no friends</Text>
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
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 50,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FriendsScreen;
