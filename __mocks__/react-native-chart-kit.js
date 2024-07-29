// __mocks__/react-native-chart-kit.js

import React from 'react';
import { View, Text } from 'react-native';

// Mock BarChart, LineChart, and PieChart components
export const BarChart = ({ data, width, height, chartConfig }) => (
  <View style={{ width, height }}>
    <Text>Mock BarChart</Text>
  </View>
);

export const LineChart = ({ data, width, height, chartConfig }) => (
  <View style={{ width, height }}>
    <Text>Mock LineChart</Text>
  </View>
);

export const PieChart = ({ data, width, height, chartConfig, accessor }) => (
  <View style={{ width, height }}>
    <Text>Mock PieChart</Text>
  </View>
);
