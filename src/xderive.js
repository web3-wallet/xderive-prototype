const createStoreImpl = (createState) => {
  let state;

  const listeners = new Set();

  const subscribe = (listener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  const getState = () => state;

  const setState = (partial, replace = false) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;

    if (nextState === state) return;

    const prevState = state;

    state = replace ? nextState : Object.assign({}, state, nextState);

    listeners.forEach((listener) => listener(state, prevState));
  };

  const destroy = () => {
    listeners.clear();
  };

  const store = {
    subscribe,
    getState,
    setState,
    destroy,
    derive,
    deriveWith,
  };

  state = createState(setState, getState, store);

  function derive(fn) {
    return xDerive(store, fn);
  }

  function deriveWith(...args) {
    return xDerive(store, ...args);
  }

  return store;
};

const xDerive = (...args) => {
  const fn = args[args.length - 1];
  const stores = args.slice(0, -1);

  const createState = fn(...stores.map((s) => s.getState()));

  const { setState, destroy, ...rest } = createStore()(createState);

  const unsubscribeFns = [];

  stores.forEach((store, i) => {
    const unsubscribe = store.subscribe((nextStateSlice) => {
      const derivedState = fn(
        ...stores.map((s, j) => (i === j ? nextStateSlice : s.getState())),
      );
      setState(derivedState);
    });

    unsubscribeFns.push(unsubscribe);
  });

  return {
    ...rest,
    destroy: () => {
      unsubscribeFns.forEach((unsubscribe) => unsubscribe());
      destroy();
    },
  };
};

const createStore = (createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl;

module.exports = {
  createStore,
  xDerive,
};
