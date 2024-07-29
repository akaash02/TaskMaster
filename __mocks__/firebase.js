const authMock = {
  onAuthStateChanged: jest.fn(),
  currentUser: { uid: 'test-uid' },
};

const firestoreMock = {
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
};

const initializeAppMock = jest.fn(() => ({
  name: '[DEFAULT]',
  options: {},
}));

const getAuthMock = jest.fn(() => authMock);

const getFirestoreMock = jest.fn(() => firestoreMock);

const initializeFirestoreMock = jest.fn(() => firestoreMock);

const persistentLocalCacheMock = jest.fn();

const persistentMultipleTabManagerMock = jest.fn();

const initializeAuthMock = jest.fn(() => authMock);

const getReactNativePersistenceMock = jest.fn(() => authMock);

export {
  authMock as auth,
  firestoreMock as firestore,
  initializeAppMock as initializeApp,
  getAuthMock as getAuth,
  getFirestoreMock as getFirestore,
  initializeFirestoreMock as initializeFirestore,
  persistentLocalCacheMock as persistentLocalCache,
  persistentMultipleTabManagerMock as persistentMultipleTabManager,
  initializeAuthMock as initializeAuth,
  getReactNativePersistenceMock as getReactNativePersistence,
};
