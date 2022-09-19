interface Store<T extends UnknownState> {
  getState: () => T;
  setState: <Nt extends R extends true ? T : Partial<T>, R extends boolean>(
    nextStateOrUpdater: Nt | ((state: T) => Nt),
    shouldReplace?: R,
  ) => void;
  subscribe: (listener: (state: T, previousState: T) => void) => () => void;
  destroy: () => void;
}

type UnknownState = object;

declare const create: <
  T extends UnknownState,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StoreInitializer<T, [], Mos>,
) => Mutate<Store<T>, Mos>;

type StoreInitializer<
  T extends UnknownState,
  Mis extends [StoreMutatorIdentifier, unknown][],
  Mos extends [StoreMutatorIdentifier, unknown][],
  U = T,
> = ((
  setState: Get<Mutate<Store<T>, Mis>, 'setState', undefined>,
  getState: Get<Mutate<Store<T>, Mis>, 'getState', undefined>,
  store: Mutate<Store<T>, Mis>,
  $$storeMutations: Mis,
) => U) & { [$$storeMutators]?: Mos };
declare const $$storeMutators: unique symbol;

interface StoreMutators<S, A> {}
type StoreMutatorIdentifier = keyof StoreMutators<unknown, unknown>;

type Mutate<S, Ms> = Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
  : never;

declare const withA: <
  T extends UnknownState,
  A,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  a: A,
  initializer: StoreInitializer<T, [...Mps, [$$withA, A]], Mcs>,
) => StoreInitializer<T, Mps, [[$$withA, A], ...Mcs]>;

declare const $$withA: unique symbol;
type $$withA = typeof $$withA;

interface StoreMutators<S, A> {
  [$$withA]: Write<S, { a: A }>;
}

type Get<T, K, F = never> = K extends keyof T ? T[K] : F;

type Write<T, U> = Omit<T, keyof U> & U;

let storeOut = create(withA('a', (set, get, store) => ({ count: 0 })));
