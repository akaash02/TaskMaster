// __mocks__/react-native-picker-select.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mock RNPickerSelect component
const RNPickerSelect = ({ onValueChange, items, style }) => (
  <View style={style?.inputIOS}>
    <Text>Mock RNPickerSelect</Text>
  </View>
);

export default RNPickerSelect;
