import { AtLeastOneOf, AllUserDataQueries } from '@/types';

export type TestUser = {
  branchId: number;
  username: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  position: string;
};

export type User = AllUserDataQueries;

type UserIdentifier = AtLeastOneOf<{
  username: string;
  email: string;
}>;

export type UserCredentials = {
  branchId?: number;
  identifier: UserIdentifier;
  password: string;
};

export type SocialAuthCode = {
  code: string;
};

const PasswordMinLength = {
  6: '6',
} as const;

export type PasswordMinLength = keyof typeof PasswordMinLength;

export type UserSignupInput = Omit<UserCredentials, 'branchId'>;
