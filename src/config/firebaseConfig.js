// src/config/firebaseConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4mDNeLw-ETdbJh6JGp5COdTQZ_SVxurI",
  authDomain: "authtest-f3cbd.firebaseapp.com",
  projectId: "authtest-f3cbd",
  storageBucket: "authtest-f3cbd.appspot.com",
  messagingSenderId: "1088554199795",
  appId: "1:1088554199795:web:5d5b8532f0d8cbbfaaa586"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export { auth, firestore };
