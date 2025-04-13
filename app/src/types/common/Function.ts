import { UserCredentials } from '@/types';

export type ErrorResponseCallback = (
  // eslint-disable-next-line no-unused-vars
  err: boolean,
  // eslint-disable-next-line no-unused-vars
  response?: any
) => void;

export type AuthCallback<T> = (
  // eslint-disable-next-line no-unused-vars
  credentials: T,
  // eslint-disable-next-line no-unused-vars
  callback?: ErrorResponseCallback
) => Promise<void> | null;

export type LoginCallback<T> = AuthCallback<T>;

export type UserLoginCallback = LoginCallback<UserCredentials>;

export type OnAfterChangeFunction = (
  _name: string,
  _value: string | boolean | undefined,
  _options?: {
    isCustomFilter?: boolean;
    removeFromMultiSelect?: string | number | undefined;
  }
) => void;
