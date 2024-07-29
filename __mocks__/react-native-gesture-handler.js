const GestureHandlerRootViewMock = jest.fn(({ children }) => children);

export const GestureHandlerRootView = GestureHandlerRootViewMock;
export default {
  GestureHandlerRootView: GestureHandlerRootViewMock,
};
