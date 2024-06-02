import React, { createContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '.';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebaseConfig';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeType, setThemeType] = useState('light');
  const [theme, setTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setThemeType(userData.theme === 'dark' ? 'dark' : 'light');
        } else {
          await setDoc(doc(firestore, 'users', user.uid), { theme: 'light' });
        }
      }
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTheme(themeType === 'dark' ? darkTheme : lightTheme);
  }, [themeType]);

  const saveThemePreference = async (themePreference) => {
    if (user) {
      await setDoc(doc(firestore, 'users', user.uid), { theme: themePreference }, { merge: true });
    }
    setThemeType(themePreference);
  };

  return (
    <ThemeContext.Provider value={{ themeType, setThemeType, theme, saveThemePreference }}>
      {!isLoading && children}
    </ThemeContext.Provider>
  );
};
