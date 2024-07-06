import React, { useContext, useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';
import NavBar from '../components/NavBar';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore, auth } from '../config/firebaseConfig'; // Updated import

const FriendsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const userId = auth.currentUser.uid;
      const friendsCollection = collection(firestore, 'users', userId, 'friends');
      const friendsSnapshot = await getDocs(friendsCollection);
      const friendsList = friendsSnapshot.docs.map(doc => doc.data());
      setFriends(friendsList);
    };

    fetchFriends();
  }, []);

  const handleSearch = async () => {
    console.log('Searching for:', search);
    try {
      const usersCollection = collection(firestore, 'users');
      const q = query(usersCollection, where('name', '==', search));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data(),
      }));
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for friends:', error);
    }
  };

  const handleAddFriend = async (friend) => {
    const userId = auth.currentUser.uid;
    const friendsCollection = collection(firestore, 'users', userId, 'friends');
    await setDoc(doc(friendsCollection, friend.userId), {
      userId: friend.userId,
      name: friend.name,
    });
    setFriends([...friends, friend]);
    setSearch('');
    setSearchResults([]);
  };

  const handleDeleteFriend = async (friendId) => {
    const userId = auth.currentUser.uid;
    const friendDocRef = doc(firestore, 'users', userId, 'friends', friendId);
    await deleteDoc(friendDocRef);
    setFriends(friends.filter(friend => friend.userId !== friendId));
  };

  const handleChat = (friend) => {
    const userId = auth.currentUser.uid;
    const chatId = [userId, friend.userId].sort().join('_');
    navigation.navigate('Chat', { chatId, friendName: friend.name });
  };

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
        centerComponent={{ text: 'Friends', style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.card }]}
        placement="left"
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <TextInput
        style={[styles.searchInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Search for friends"
        placeholderTextColor={theme.colors.text}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAddFriend(item)}>
            <View style={[styles.friendItem, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.friendText, { color: theme.colors.text }]}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Text style={[styles.LowerText, { color: theme.colors.text }]}>My Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.friendItem, { backgroundColor: theme.colors.card }]} 
            onPress={() => handleChat(item)}
          >
            <Text style={[styles.friendText, { color: theme.colors.text }]}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteFriend(item.userId)}>
              <Icon name="delete" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <NavBar navigation={navigation} userId={auth.currentUser.uid} scheduleId={'yourScheduleId'} />
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
    fontSize: 45,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  LowerText: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  searchInput: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  friendText: {
    fontSize: 18,
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 20,
  },
});

export default FriendsScreen;
