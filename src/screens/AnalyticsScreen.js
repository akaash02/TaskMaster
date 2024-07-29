import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';
import { ThemeContext } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { backend } from '@tensorflow/tfjs';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [selectedMetric, setSelectedMetric] = useState('tasks');

  const taskOverviewData = [
    { name: 'Pending Tasks', population: 30, color: '#f39c12', legendFontColor: theme.colors.text, legendFontSize: 15 },
    { name: 'Completed Tasks', population: 50, color: '#2ecc71', legendFontColor: theme.colors.text, legendFontSize: 15 },
    { name: 'Deleted Tasks', population: 20, color: '#e74c3c', legendFontColor: theme.colors.text, legendFontSize: 15 },
  ];

  const overallOverviewData = {
    tasks: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { data: [20, 45, 28, 80, 99, 43, 50, 67, 89, 76, 54, 40], color: () => `#2980b9`, strokeWidth: 2 },
      ],
    },
    hours: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { data: [100, 200, 150, 300, 250, 220, 210, 230, 240, 260, 270, 280], color: () => `#8e44ad`, strokeWidth: 2 },
      ],
    },
  };

  const sleepHoursData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { data: [210, 195, 220, 200, 210, 205, 190, 210, 220, 215, 225, 230], color: () => `#27ae60`, strokeWidth: 2 },
    ],
  };

  const sleepHeatmapData = [
    { day: 'Mon', hours: 7, month: 'Jan' },
    { day: 'Tue', hours: 6.5, month: 'Jan' },
    { day: 'Wed', hours: 8, month: 'Jan' },
    { day: 'Thu', hours: 7.5, month: 'Jan' },
    { day: 'Fri', hours: 8, month: 'Jan' },
    { day: 'Sat', hours: 6, month: 'Jan' },
    { day: 'Sun', hours: 7, month: 'Jan' },
    { day: 'Mon', hours: 6, month: 'Feb' },
    { day: 'Tue', hours: 5.5, month: 'Feb' },
  ];

  const tasksHeatmapData = [
    { day: 'Mon', tasks: 3, month: 'Jan' },
    { day: 'Tue', tasks: 5, month: 'Jan' },
    { day: 'Wed', tasks: 2, month: 'Jan' },
    { day: 'Thu', tasks: 4, month: 'Jan' },
    { day: 'Fri', tasks: 6, month: 'Jan' },
    { day: 'Sat', tasks: 1, month: 'Jan' },
    { day: 'Sun', tasks: 3, month: 'Jan' },
    { day: 'Mon', tasks: 2, month: 'Feb' },
    { day: 'Tue', tasks: 4, month: 'Feb' },
  ];

  const getColorForHeatmap = (value, type) => {
    if (type === 'sleep') {
      if (value >= 7) return '#27ae60'; // green for sufficient proper sleep
      if (value >= 6) return '#f1c40f'; // yellow for sufficient but improper sleep
      return '#e74c3c'; // red for insufficient and improper sleep
    }
    if (type === 'tasks') {
      if (value >= 5) return '#27ae60'; // green for many tasks completed
      if (value >= 3) return '#f1c40f'; // yellow for moderate tasks completed
      return '#e74c3c'; // red for few tasks completed
    }
  };

  const calculateCompletionPercentage = () => {
    const completed = taskOverviewData.find(task => task.name === 'Completed Tasks').population;
    const total = taskOverviewData.reduce((sum, task) => sum + task.population, 0);
    return (completed / total) * 100;
  };

  const completionPercentage = calculateCompletionPercentage().toFixed(1);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 0.2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderHeatmap = (data, type) => {
    const months = [...new Set(data.map(d => d.month))];
  
    const chunkArray = (arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };
  
    const renderMonth = ({ item: month }) => {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); // Days in current month
      const monthData = data.filter(d => d.month === month);
      const daysArray = Array.from({ length: daysInMonth }, (_, index) => {
        const date = `${index + 1}/${new Date().getMonth() + 1}`;
        const dayData = monthData.find(d => d.date === date);
        return (
          <View key={index} style={[styles.heatmapCell, { backgroundColor: getColorForHeatmap(dayData ? dayData[type] : 0, type) }]}>
            <Text style={styles.heatmapText}>{index + 1}</Text>
          </View>
        );
      });
  
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
      const emptyCells = Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <View key={`empty-${index}`} style={[styles.heatmapCell, { backgroundColor: 'transparent' }]} />
      ));
  
      const heatmapArray = [...emptyCells, ...daysArray];
      const rows = chunkArray(heatmapArray, 7);
  
      return (
        <View style={styles.heatmapMonthContainer}>
          <Text style={styles.heatmapMonthHeader}>{month}</Text>
          <View style={styles.heatmapContainer}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.heatmapRow}>
                {row}
              </View>
            ))}
          </View>
        </View>
      );
    };
  
    return (
      <FlatList
        horizontal
        pagingEnabled
        data={months}
        keyExtractor={(item) => item}
        renderItem={renderMonth}
        showsHorizontalScrollIndicator={false}
      />
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Profile')}>
        <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
      </TouchableOpacity>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Current Tasks Overview</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 100, marginTop: 130, }}>
          <PieChart
            data={taskOverviewData}
            width={screenWidth - 30}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            center={[screenWidth / 13, 0]}
            marginTop = "50"
          />
          <View style={[styles.percentageContainer, { backgroundColor: theme.colors.background }]}>
            <Text
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                color: completionPercentage < 50 ? '#e74c3c' : completionPercentage < 75 ? '#f1c40f' : '#27ae60',
              }}
            >
              {completionPercentage}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Overall Overview</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedMetric(value)}
          items={[
            { label: 'No. of tasks completed / month', value: 'tasks' },
            { label: 'No. of hours spent on tasks / month', value: 'hours' },
          ]}
          style={{ ...pickerSelectStyles, inputIOS: { ...pickerSelectStyles.inputIOS, color: theme.colors.text }, inputAndroid: { ...pickerSelectStyles.inputAndroid, color: theme.colors.text } }}
        />
        <LineChart
          data={overallOverviewData[selectedMetric]}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          backgroundColor="transparent"
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Tasks Heatmap</Text>
        {renderHeatmap(tasksHeatmapData, 'tasks')}
      </View>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sleep Hours per Month</Text>
        <LineChart
          data={sleepHoursData}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sleep Heatmap</Text>
        {renderHeatmap(sleepHeatmapData, 'sleep')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentageContainer: {
    top: '-184%',
    left: '-16.5%',
    width: 150,
    height: 150,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 30,
  },
  chartContainer: {
    marginTop: 0
  },
  chartTitle: {
    marginTop: 30,
    marginLeft: 90,
    fontSize: 20,
    fontWeight: 'bold',
  },
  heatmapContainer: {
    flexDirection: 'column',
    width: screenWidth,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: screenWidth - 30, 
  },
  heatmapCell: {
    width: (screenWidth - 60) / 7,
    height: (screenWidth - 60) / 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  heatmapText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  heatmapMonthContainer: {
    width: screenWidth,
    marginRight: 15,
  },
  heatmapMonthHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, 
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
    marginBottom: 10,
  },
});

export default AnalyticsScreen;
