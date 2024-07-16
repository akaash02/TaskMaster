import * as tf from '@tensorflow/tfjs';

export const createModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    units: 10,
    activation: 'relu',
    inputShape: [4]
  }));
  model.add(tf.layers.dense({
    units: 1
  }));
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError'
  });  
  return model;
};

export const trainModel = async (model, inputs, labels) => {
  const history = await model.fit(inputs, labels, {
    epochs: 25,
    batchSize: 4,
    shuffle: true,
    validationSplit: 0.5
  });
  console.log('Training History:', history.history);
  return history;
};


export const predictSleepQuality = (model, inputTensor) => {
  const predictions = model.predict(inputTensor);
  return predictions.arraySync();
};

export const predictSingle = (model, input) => {
  const inputTensor = tf.tensor2d([input]);
  const prediction = model.predict(inputTensor);
  return prediction.arraySync()[0];
};
