import * as tf from '@tensorflow/tfjs';

export const initTensorFlow = async () => {
  try {
    await tf.ready();
    console.log("TensorFlow.js is ready");
  } catch (error) {
    console.error('Error initializing TensorFlow.js:', error);
  }
};

export const createModel = () => {
    console.log("createModel function called");
  
    try {
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [3] }));
      model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
  
      console.log("Model Summary:");
      model.summary();
  
      return model;
    } catch (error) {
      console.error("Error creating model:", error);
      console.error("TensorFlow.js version:", tf.version);
      console.error("TensorFlow.js backend:", tf.getBackend());
      throw error;
    }
  };
  

export const trainModel = async (model, sleepData) => {
  console.log("trainModel function called");

  const inputs = sleepData.map(data => [data.startTime, data.endTime, data.hoursSlept]);
  const labels = sleepData.map(data => [data.quality]);

  const inputTensor = tf.tensor2d(inputs);
  const labelTensor = tf.tensor2d(labels);

  console.log("Input Tensor:", inputTensor);
  console.log("Label Tensor:", labelTensor);

  try {
    await model.fit(inputTensor, labelTensor, {
      epochs: 100,
    });
    console.log("Model training completed");
  } catch (error) {
    console.error("Error training model:", error);
  }

  return model;
};

export const predictQuality = (model, sleepData) => {
  console.log("predictQuality function called");

  const inputs = sleepData.map(data => [data.startTime, data.endTime, data.hoursSlept]);
  const inputTensor = tf.tensor2d(inputs);

  try {
    const predictions = model.predict(inputTensor);
    console.log("Predictions:", predictions);

    return predictions.arraySync();
  } catch (error) {
    console.error("Error making predictions:", error);
    return [];
  }
};
