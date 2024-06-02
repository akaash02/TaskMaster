import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Header, Icon, Text } from 'react-native-elements';
import { ThemeContext } from '../themses/ThemeContext';

const FriendsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

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
      <View style={[styles.bottomNav, { backgroundColor: theme.colors.card }]}>
        <Icon
          name='home'
          type='material'
          onPress={() => navigation.navigate('Home')}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name='calendar-today'
          type='material'
          onPress={() => navigation.navigate('Calendar', { userId: 'yourUserId', scheduleId: 'yourScheduleId' })}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name='people'
          type='material'
          onPress={() => navigation.navigate('Friends')}
          size={30}
          color={theme.colors.text}
        />
        <Icon
          name='person'
          type='material'
          onPress={() => navigation.navigate('Profile')}
          size={30}
          color={theme.colors.text}
        />
      </View>
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
});

export default FriendsScreen;
