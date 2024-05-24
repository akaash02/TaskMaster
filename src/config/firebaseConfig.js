// src/config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4mDNeLw-ETdbJh6JGp5COdTQZ_SVxurI",
  authDomain: "authtest-f3cbd.firebaseapp.com",
  projectId: "authtest-f3cbd",
  storageBucket: "authtest-f3cbd.appspot.com",
  messagingSenderId: "1088554199795",
  appId: "1:1088554199795:web:5d5b8532f0d8cbbfaaa586"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('Firebase Auth Initialized:', auth);

export { auth };
