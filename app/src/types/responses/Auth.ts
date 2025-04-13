import { currentUser } from '@/api/__generated__/current-user';
import { UserLoginCallback } from '@/types';

export type AllUserDataQueries = currentUser['currentUser'] | undefined | null;

export type UserAuthResponse = {
  user: AllUserDataQueries;
  login: UserLoginCallback;
  logout: () => void;
  loading: boolean;
};

export type UseAuthReturn = UserAuthResponse;
