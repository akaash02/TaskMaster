import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Header, Icon, Card } from 'react-native-elements';

const HomeScreen = ({ navigation }) => {
  const currentDate = new Date();

  // Format the date as "21 May"
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  // Format the day as "Tuesday"
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Hi Akaash!', style: styles.headerText }}
        containerStyle={styles.headerContainer}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <Image
        source={require('../../assets/main_logo_no_text.png')}
        style={styles.logo}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card containerStyle={[styles.card, styles.dateCard]}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.date}>{formattedDate}</Text>
              <Text style={styles.day}>{formattedDay}</Text>
            </View>
          </Card>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Card containerStyle={[styles.card, styles.standardCard]}>
              <View style={styles.cardContent}>
                <Icon name="event" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Today's Schedule</Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Task')}>
        <Card containerStyle={[styles.card, styles.standardCard]}>
          <View style={styles.cardContent}>
            <Icon name="add" type="material" size={27} color="#03012E" />
            <Text style={styles.cardTitle}>Add Task</Text>
          </View>
        </Card>
      </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
            <Card containerStyle={[styles.card, styles.standardCard]}>
              <View style={styles.cardContent}>
                <Icon name="people" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Friends</Text>
              </View>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Card containerStyle={[styles.card, styles.standardCard]}>
              <View style={styles.cardContent}>
                <Icon name="person" type="material" size={27} color="#03012E" />
                <Text style={styles.cardTitle}>Profile</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03012E',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#03012E',
    paddingBottom: 20, // Add padding bottom to account for bottom navigation
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
  logo: {
    width: 100,
    height: 110,
    alignSelf: 'center',
    marginVertical: 20,
  },
  card: {
    width: 400,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCard: {
    height: 200, // Adjust height as needed
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  standardCard: {
    height: 100, // Adjust height as needed
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateTimeContainer: {
    alignItems: 'center',
    width: 200,
  },
  date: {
    fontSize: 37,
    color: '#03012E',
    fontWeight: 'bold',
  },
  day: {
    fontSize: 32,
    color: '#03012E',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 34, // Adjust font size as needed
    color: '#03012E',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;