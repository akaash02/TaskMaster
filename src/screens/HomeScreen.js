import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Header, Icon, Card } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';

const HomeScreen = ({ navigation }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const formattedDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'Hello Akaash!', style: styles.headerText }}
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

          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#fff',
              textSectionTitleDisabledColor: '#d9e1e8',
              selectedDayBackgroundColor: '#6aa8f2',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#6aa8f2',
              dayTextColor: '#ffffff',
              textDisabledColor: '#2d4150',
              dotColor: '#6aa8f2',
              selectedDotColor: '#ffffff',
              arrowColor: '#ffffff',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#ffffff',
              indicatorColor: '#ffffff',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
            }}
          />

          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Task')}>
              <Card containerStyle={[styles.card, styles.iconCard]}>
                <Icon name="add" type="material" size={27} color="#03012E" />
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Friends')}>
              <Card containerStyle={[styles.card, styles.iconCard]}>
                <Icon name="people" type="material" size={27} color="#03012E" />
              </Card>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Card containerStyle={[styles.card, styles.iconCard]}>
                <Icon name="person" type="material" size={27} color="#03012E" />
              </Card>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
        <View style={styles.container}>
        <Text style={styles.mytasksText}>My Tasks</Text>
      </View>
      </TouchableOpacity>
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
    paddingBottom: 20, 
  },
  headerContainer: {
    paddingTop: 0,
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
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 110,
    alignSelf: 'center',
    marginVertical: 20,
  },
  card: {
    borderRadius: 500,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCard: {
    width: 400,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconCard: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeContainer: {
    alignItems: 'center',
    width: 200,
  },
  date: {
    fontSize: 25,
    color: '#03012E',
    fontWeight: 'bold',
  },
  day: {
    fontSize: 20,
    color: '#03012E',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '75%',
    marginTop: 20,
  },
  calendar: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
  mytasksText: {
    color: '#fff',
    fontSize: 25,
    textAlign: 'left',
    fontWeight: 'bold',
    paddingLeft: 20,
  },
});

export default HomeScreen;
