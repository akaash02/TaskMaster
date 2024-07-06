import React, { useContext, useState, useEffect } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore, auth } from '../config/firebaseConfig'; // Updated import

const ChatScreen = ({ route }) => {
  const { chatId, friendName } = route.params;
  const { theme } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()  // Convert Firestore timestamp to JS Date
      }));
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    const userId = auth.currentUser.uid;
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: new Date(),
      userId,
    });
    setNewMessage('');
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
        centerComponent={{ text: friendName, style: [styles.headerText, { color: theme.colors.text }] }}
        containerStyle={[styles.headerContainer, { backgroundColor: theme.colors.card }]}
        statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}
      />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageItem, { backgroundColor: item.userId === auth.currentUser.uid ? theme.colors.primary : theme.colors.card }]}>
            <Text style={[styles.messageText, { color: theme.colors.text }]}>{item.text}</Text>
          </View>
        )}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.text}
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.sendButtonText, { color: theme.colors.text }]}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  messageItem: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 18,
  },
  input: {
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  sendButton: {
    margin: 10,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
