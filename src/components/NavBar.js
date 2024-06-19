import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';

const NavBar = ({ navigation, userId, scheduleId }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.colors.card }]}>
      <Icon
        name="home"
        type="material"
        onPress={() => navigation.navigate('Home')}
        size={30}
        color={theme.colors.text}
      />
      <Icon
        name="calendar-today"
        type="material"
        onPress={() => navigation.navigate('Calendar', { userId, scheduleId })}
        size={30}
        color={theme.colors.text}
      />
      <Icon
        name="people"
        type="material"
        onPress={() => navigation.navigate('Friends')}
        size={30}
        color={theme.colors.text}
      />
      <Icon
        name="person"
        type="material"
        onPress={() => navigation.navigate('Profile')}
        size={30}
        color={theme.colors.text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
});

export default NavBar;
