console.log('react-native-elements mock is being used');

import React from 'react';
import { View } from 'react-native';

export const Icon = ({ name, type, size, color }) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);

export const Button = ({ title }) => (
  <View><Text>{title}</Text></View>
);
