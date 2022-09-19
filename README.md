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
type SetState<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;

interface Store<T extends State> {
	getState: () => T;
	setState: SetState;
	subscribe: (state: T, prevState: T) => () => void;
	destroy: () => void;
  derive<K>: (
  	state: T,
  	(store: Store<T>) => (store: Store<K>) => K
  ) => Store<K>;
  deriveWith<T1, T2, T3, ... K>: (
    s1: Store<T1>,
    s2: Store<T2>,
    s3: Store<T3>,
    ...,
    (s: T, s1: T1, s2: T2, s3: T3, ...) => (store: Store<K>) => K
	) => Store<K>;
}
```

## Derived store

A derived store is a store derived from one or more derived or non-derived stores. The API of a derived store is the same as the a non-derived store, with the except that a derived store doesn't expose it's `setState` API to the external world. Instead a derived store only update it's state passively by reacting to the changes of it's upstream stores.

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
  console.log(`move from ${displayPoint(p1)} to ${displayPoint(p2)}`);
});

distOA.subscribe(({ dist }) => {
  console.log(`The distance from A to origin is: ${dist}`);
});

// move from origin to {x: 1, y: 1, z: 1}
pointA.setState({ x: 1, y: 1, z: 1 });

// move to {x: 1, y: 2, z: 3}
pointA.setState({ y: 2, z: 3 });
```
