const { createStore, xDerive } = require('./xderive');

test('store: create, update, subscribe, destroy', () => {
  const initialState = { x: 1, y: 2, z: 3 };
  const store = createStore()(() => initialState);
  expect(store.getState()).toEqual(initialState);

  const listener = jest.fn((newState, prevState) => {});

  store.subscribe(listener);
  store.setState({ x: 2 });

  expect(store.getState()).toEqual({ ...initialState, x: 2 });

  expect(listener.mock.calls).toHaveLength(1);

  store.setState({ z: 4 });

  expect(store.getState()).toEqual({ x: 2, y: 2, z: 4 });

  expect(listener.mock.calls).toHaveLength(2);

  store.destroy();

  store.setState({ y: 5 });

  expect(listener.mock.calls).toHaveLength(2);
});

test('store.derive', () => {
  const initialState = { x: 2, y: 3, z: 4 };

  const store = createStore()(() => initialState);

  const square = store.derive((state) => () => {
    return Object.entries(state).reduce((acc, [k, v]) => {
      acc[k] = v * v;
      return acc;
    }, {});
  });

  const sum = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc + n, 0),
  }));

  const mul = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc * n, 1),
  }));

  expect(store.getState()).toEqual(initialState);
  expect(square.getState()).toEqual({ x: 4, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 9 });
  expect(mul.getState()).toEqual({ r: 24 });

  const listener = jest.fn((newState, prevState) => {});

  square.subscribe(listener);
  sum.subscribe(listener);
  mul.subscribe(listener);

  store.setState({ x: 5 });

  expect(listener.mock.calls).toHaveLength(3);

  expect(square.getState()).toEqual({ x: 25, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 12 });
  expect(mul.getState()).toEqual({ r: 60 });
});

test('xDerive', () => {
  const initialState = { x: 2, y: 3, z: 4 };

  const store = createStore()(() => initialState);

  const square = store.derive((state) => () => {
    return Object.entries(state).reduce((acc, [k, v]) => {
      acc[k] = v ** 2;
      return acc;
    }, {});
  });

  const sum = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc + n, 0),
  }));

  const mul = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc * n, 1),
  }));

  expect(store.getState()).toEqual(initialState);
  expect(square.getState()).toEqual({ x: 4, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 9 });
  expect(mul.getState()).toEqual({ r: 24 });

  const sumAll = xDerive(store, square, sum, mul, (s0, s1, s2, s3) => () => ({
    r: s0.x + s0.y + s0.z + s1.x + s1.y + s1.z + s2.r + s3.r,
  }));

  expect(sumAll.getState()).toEqual({
    r: 2 + 3 + 4 + 4 + 9 + 16 + 9 + 24,
  });

  const listener = jest.fn((newState, prevState) => {});

  store.subscribe(listener);
  square.subscribe(listener);
  sum.subscribe(listener);
  mul.subscribe(listener);
  sumAll.subscribe(listener);

  store.setState({ x: 5 });

  expect(store.getState()).toEqual({ x: 5, y: 3, z: 4 });
  expect(square.getState()).toEqual({ x: 25, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 12 });
  expect(mul.getState()).toEqual({ r: 60 });

  expect(sumAll.getState()).toEqual({
    //  result = 5 + 3 + 4 + 25 + 9 + 16 + 12 + 60 = 134
    r: 134,
  });

  expect(listener.mock.calls).toHaveLength(8);

  const revert = sumAll.derive((s) => () => ({
    r: -s.r,
  }));

  expect(revert.getState()).toEqual({
    r: -134,
  });

  const merge = revert.deriveWith(store, (negative, state) => () => ({
    ...negative,
    ...state,
  }));

  expect(merge.getState()).toEqual({
    r: -134,
    x: 5,
    y: 3,
    z: 4,
  });
});

/**
 * similar to xDerive
 */
test('store.deriveWith', () => {
  const initialState = { x: 2, y: 3, z: 4 };

  const store = createStore()(() => initialState);

  const square = store.derive((state) => () => {
    return Object.entries(state).reduce((acc, [k, v]) => {
      acc[k] = v ** 2;
      return acc;
    }, {});
  });

  const sum = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc + n, 0),
  }));

  const mul = store.derive((state) => () => ({
    r: Object.values(state).reduce((acc, n) => acc * n, 1),
  }));

  expect(store.getState()).toEqual(initialState);
  expect(store.getState()).toEqual({ x: 2, y: 3, z: 4 });
  expect(square.getState()).toEqual({ x: 4, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 9 });
  expect(mul.getState()).toEqual({ r: 24 });

  const sumAll = store.deriveWith(square, sum, mul, (s0, s1, s2, s3) => () => ({
    r: s0.x + s0.y + s0.z + s1.x + s1.y + s1.z + s2.r + s3.r,
  }));

  expect(sumAll.getState()).toEqual({
    r: 2 + 3 + 4 + 4 + 9 + 16 + 9 + 24,
  });

  const listener = jest.fn((newState, prevState) => {});

  store.subscribe(listener);
  square.subscribe(listener);
  sum.subscribe(listener);
  mul.subscribe(listener);
  sumAll.subscribe(listener);

  store.setState({ x: 5 });

  expect(store.getState()).toEqual({ x: 5, y: 3, z: 4 });
  expect(square.getState()).toEqual({ x: 25, y: 9, z: 16 });
  expect(sum.getState()).toEqual({ r: 12 });
  expect(mul.getState()).toEqual({ r: 60 });

  expect(sumAll.getState()).toEqual({
    r: 5 + 3 + 4 + 25 + 9 + 16 + 12 + 60,
  });

  expect(listener.mock.calls).toHaveLength(8);
});
