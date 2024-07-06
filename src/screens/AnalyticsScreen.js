import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit'; // Example chart libraries
import firebase from 'firebase';

const AnalyticsScreen = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [averageDuration, setAverageDuration] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  
  useEffect(() => {
    // Fetch data from Firebase
    const fetchCompletedTasks = async () => {
      const userId = firebase.auth().currentUser.uid;
      const tasksSnapshot = await firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('schedules')
        .doc('scheduleId') // Replace with actual schedule ID
        .collection('tasks')
        .where('completed', '==', true)
        .get();
        
      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      setCompletedTasks(tasks);
      
      // Calculate total tasks
      setTotalTasks(tasks.length);
      
      // Calculate average duration
      const totalDuration = tasks.reduce((acc, task) => acc + task.duration, 0);
      setAverageDuration(totalDuration / tasks.length);
      
      // Calculate completion rate
      const totalCreatedTasksSnapshot = await firebase.firestore()
        .collection('users')
        .doc(userId)
        .collection('schedules')
        .doc('scheduleId') // Replace with actual schedule ID
        .collection('tasks')
        .get();
        
      const totalCreatedTasks = totalCreatedTasksSnapshot.docs.length;
      setCompletionRate((tasks.length / totalCreatedTasks) * 100);
    };

    fetchCompletedTasks();
  }, []);

  return (
    <ScrollView>
      <View>
        <Text>Total Tasks Completed: {totalTasks}</Text>
        <Text>Average Task Duration: {averageDuration.toFixed(2)} minutes</Text>
        <Text>Task Completion Rate: {completionRate.toFixed(2)}%</Text>
        
        {/* Example charts */}
        <BarChart
          data={{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
              {
                data: [20, 45, 28, 80, 99, 43]
              }
            ]
          }}
          width={400} // from react-native
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        
        <PieChart
          data={[
            {
              name: 'Work',
              population: 21500000,
              color: '#f00',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            },
            {
              name: 'Personal',
              population: 2800000,
              color: '#0f0',
              legendFontColor: '#7F7F7F',
              legendFontSize: 15
            }
          ]}
          width={400}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
