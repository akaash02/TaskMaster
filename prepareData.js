import * as tf from '@tensorflow/tfjs';

export const prepareData = (data) => {
  const maxStartTime = Math.max(...data.map(d => d.startTime));
  const maxEndTime = Math.max(...data.map(d => d.endTime));
  const maxHoursSlept = Math.max(...data.map(d => d.hoursSlept));
  const maxSleepQuality = Math.max(...data.map(d => d.sleepQuality));

  // Avoid division by zero
  const safeDiv = (value, max) => (max === 0 ? 0 : value / max);

  const inputTensor = tf.tensor2d(data.map(item => [
    safeDiv(item.startTime, maxStartTime),
    safeDiv(item.endTime, maxEndTime),
    safeDiv(item.hoursSlept, maxHoursSlept),
    safeDiv(item.sleepQuality, maxSleepQuality)
  ]));
  
  const labelTensor = tf.tensor2d(data.map(item => [safeDiv(item.sleepQuality, maxSleepQuality)]));

  // Log the processed data for debugging
  console.log('Processed Input Data:', inputTensor.arraySync());
  console.log('Processed Label Data:', labelTensor.arraySync());
  
  return { inputTensor, labelTensor };
};
