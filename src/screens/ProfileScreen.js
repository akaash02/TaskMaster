import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Header, Icon, Text } from 'react-native-elements';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'My Profile', style: styles.headerText }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>  </Text>
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
    color: '#fff',
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
