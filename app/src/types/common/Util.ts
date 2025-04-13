export type AtLeastOneOf<T> = {
  [K in keyof T]: {
    // eslint-disable-next-line no-unused-vars
    [key in K]: T[K];
  };
}[keyof T];

export type OnlyRequired<T, K extends keyof T> = Required<Pick<T, K>> &
  Partial<Omit<T, K>>;
