// __mocks__/@tensorflow/tfjs.js
const tf = {
    tensor: jest.fn(),
    tidy: jest.fn(),
    sequential: jest.fn(),
    layers: {
      dense: jest.fn(),
      activation: jest.fn(),
      dropout: jest.fn(),
    },
    train: {
      sgd: jest.fn(),
    },
    optimizer: jest.fn(),
    // Add other TensorFlow methods you use here
  };
  
  export default tf;
  