import React, { useContext, useState, useEffect } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore, auth } from '../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ route, navigation }) => {
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
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
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
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.text}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: theme.colors.text }]}>
          <Text style={[styles.sendButtonText, { color: theme.colors.background }]}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0,
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  messageItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
