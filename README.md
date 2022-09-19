## State

- A state is a plain object.

- State changes overtime.

```typescript
type State = unknown;
```

## Store

Each store manages a state.

Store have the following interface

```typescript
type SetState<T> =
(partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;

type StateCreator<T> = (s: Store<T>) => T;

type Unsubscribe = () => void;

interface StateDeriveFn {
  <T, R>(s: T): StateCreator<R>>;
  <T, T1, R>(s: T, s1: T1): StateCreator<R>;
  <T, T1, T2, R>(s: T, s1: T1, s2: T2): StateCreator<R>;
  ...
}

interface Store<T extends State> {
	getState: () => T;
	setState: SetState<T>;
	subscribe: (state: T, prevState: T) => Unsubscribe;
	destroy: () => void;
  derive<R>: (state: T, fn: StateDeriveFn) => Store<R>;
  deriveWith<T1, T2, ... K>: (
    s: Store<T>, s1: Store<T1>, s2: Store<T2>, ..., fn: StateDeriveFn
  ) => Store<R>;
}
```

## Derived store

A derived store is a store derived from one or more derived or non-derived stores. The API of a derived store is the same as the non-derived store with the exception that a derived store doesn't expose it's `setState` API to the external world. Instead a derived store only update it's state passively by reacting to the changes of it's upstream stores.

## Middleware

A middleware is a high order function that takes a `StateCreator` as it's input, and returns a `StateCreator`.

```typescript
type Middleware<T> = (f: StateCreator<T>) => StateCreator<T>;
```

**CreateMiddleware**

```typescript
type CreateMiddleware<O, T> = (options: O) => Middleware<T>;
```

# Implementation

- [xderive.js](./src//xderive.js)

# Test

- [xderive.spec.js](./src//xderive.spec.js)

```
npm run test
```

## Examples

```typescript
type Point = {
  x: number;
  y: number;
  z: number;
};

const origin: Point = { x: 0, y: 0, z: 0 };
const displayPoint = ({ x, y, z }: Point) => `(x: ${x}, y: ${y}, z: ${z})`;

const pointA = createStore<Point>()(() => origin);

const distOA = pointA.derive((pA) => () => ({
  dist: Math.sqrt(Math.pow(pA.x, 2) + Math.pow(pA.y, 2) + Math.pow(pA.z, 2)),
}));

pointA.subscribe((p2, p1) => {
  console.log(`Move from ${displayPoint(p1)} to ${displayPoint(p2)}`);
});

distOA.subscribe(({ dist }) => {
  console.log(`The distance from origin to pointA is: ${dist}`);
});

// move from origin to {x: 1, y: 1, z: 1}
pointA.setState({ x: 1, y: 1, z: 1 });

// move from {x: 1, y: 1, z: 1} to {x: 1, y: 2, z: 3}
pointA.setState({ y: 2, z: 3 });
```
