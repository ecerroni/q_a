import { ReactNode } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import history from '@/routes';
import { APP } from '@/apollo/_config';
import { CURRENT_USER_QUERY, LOGIN_MUTATION } from '@/api';
import { base64String } from '@/utils';
import { useTypedQuery } from '@/hooks';
import { UseAuthReturn, ErrorResponseCallback, UserSignupInput } from '@/types';

// TODO: use ts enums alternatives
const { ROUTES: { LOGIN } = {} } = APP;

const useAuth = (): UseAuthReturn | ReactNode => {
  const { data, loading } = useTypedQuery(CURRENT_USER_QUERY, {});
  const { currentUser } = data ?? {};
  const [submitLogin] = useMutation(LOGIN_MUTATION);
  const client = useApolloClient();
  if (loading) return <p>Loading...</p>;
  const logout = (
    // eslint-disable-next-line no-unused-vars
    callback?: ErrorResponseCallback,
    { cacheOnly = false } = {}
  ) => {
    if (cacheOnly) {
      client.clearStore();
    } else {
      client.resetStore();
    }
    if (callback) {
      console.log({ callback });
      callback(false, 'success');
    } else history.navigate(`${LOGIN}`, { replace: true });
    console.log('You have logged out');
  };

  const login = async (
    { identifier, password }: UserSignupInput,
    // eslint-disable-next-line no-unused-vars
    callback?: ErrorResponseCallback
  ): Promise<void> => {
    let username, email;
    if ('username' in identifier) username = identifier.username;
    if ('email' in identifier) email = identifier.email;
    return submitLogin({
      variables: {
        userCredentials: {
          username: email || username || '',
          password: base64String(password),
        },
      },
      refetchQueries: [
        {
          query: CURRENT_USER_QUERY,
        },
      ],
    })
      .then(res => {
        if (callback) {
          callback(false, res);
        } else history.navigate('/', { replace: true });
        console.log('Login successful');
      })
      .catch(e => {
        // notify error
        // console.log(e)
        if (callback) callback(e);
      });
  };
  return {
    user: currentUser,
    loading,
    login,
    logout,
  };
};
export default useAuth;
