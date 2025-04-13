import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { jwtDecode as decode } from 'jwt-decode';
import { CrunchedData, uncrunch } from 'graphql-crunch';
import { toast } from 'react-toastify';
import { NAMESPACE } from '#/settings/app.json';
import {
  APP,
  SERVER_MESSAGES,
  AUTH,
  CLIENT_AUTH_REQUEST_TYPE,
  CLIENT_AUTHENTICATION_METHOD,
  JWT,
  CRUNCH,
} from './_config';
import history from '@/routes';
import { NetworkError } from '@apollo/client/errors';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

const uncruncher = new ApolloLink((operation, forward) =>
  forward(operation).map(response => {
    console.log({ operation, response });
    const { data } = response;
    response.data = uncrunch((data as CrunchedData) ?? []) as
      | Record<string, unknown>
      | null
      | undefined;

    return response;
  })
);

const { UNAUTHORIZED, FORBIDDEN } = SERVER_MESSAGES;

const {
  ROUTES: { LOGIN = '/login', SIGNUP = './signup' },
} = APP;

// replaced dyanmicaly
const date = '__DATE__';
const appId = '__APP_ID__';

const version = import.meta.env.PACKAGE_VERSION || 'unkown';
const versionSignature = `ID: ${NAMESPACE} | APP: ${appId} | Version: ${version} | Built at: ${date}`;

const opts = {
  credentials: 'same-origin',
  headers: {
    [`x-${NAMESPACE}-version`]: versionSignature,
    [AUTH.STRATEGIES.CLIENT.AUTH_HEADER]: CLIENT_AUTH_REQUEST_TYPE,
  },
};

const useLocalStorage = CLIENT_AUTHENTICATION_METHOD.LOCAL_STORAGE;

const apolloCache = new InMemoryCache();
const uri =
  CRUNCH && CRUNCH.USE
    ? `${APP.ENDPOINT.GRAPHQL}?crunch=${CRUNCH.VERSION}`
    : APP.ENDPOINT.GRAPHQL;

const httpLink = new HttpLink({
  uri,
  ...opts,
});

// const localeRedirectionPath = path => {
//   var locales = availableLanguages;

//   var locale =
//     locales.find(lang => lang === history?.location?.pathname.split("/")[1]) ||
//     defaultLocale;

//   return `/${locale}${path}`;
// };

const authMiddlewareLink = setContext(() => {
  // let lang = pathname.split("/")?.[1] ?? defaultLocale; // ex. '/en/app/onboarding'
  // lang = availableLanguages.includes(lang) ? lang : defaultLocale;
  // const langHeader = {
  //   [APP.PREFIX + APP.NAMESPACE + "-lang"]: lang,
  // };
  const headers: {
    [key: string]: {
      [key: string]: string | null;
    };
  } = {
    headers: {
      // ...langHeader,
      [JWT.HEADER.TOKEN.NAME]:
        localStorage.getItem(JWT.LOCAL_STORAGE.TOKEN.NAME) || null,
      [JWT.HEADER.REFRESH_TOKEN.NAME]:
        localStorage.getItem(JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME) || null, // eslint-disable-line
    },
  };

  if (headers.headers[JWT.HEADER.REFRESH_TOKEN.NAME]) {
    const currentTime = Date.now().valueOf() / 1000;
    const tokenExpiration = decode<{
      exp: number;
    }>(headers.headers[JWT.HEADER.REFRESH_TOKEN.NAME] as string).exp;
    if (currentTime > tokenExpiration) {
      history.navigate(LOGIN);
    }
  }
  return headers;
});

const afterwareLink = new ApolloLink((operation, forward) =>
  forward(operation).map(response => {
    const context = operation.getContext();
    const {
      response: { headers },
    } = context;

    if (headers) {
      const token = headers.get(JWT.HEADER.TOKEN.NAME);
      const refreshToken = headers.get(JWT.HEADER.REFRESH_TOKEN.NAME);

      if (token) {
        localStorage.setItem(JWT.LOCAL_STORAGE.TOKEN.NAME, token);
      }

      if (refreshToken) {
        localStorage.setItem(
          JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME,
          refreshToken
        );
      }
    }

    return response;
  })
);

const getStatusCode = (
  err: NetworkError | Record<string, never> | null
): number | null => {
  if (err && 'statusCode' in err) return err.statusCode;
  return null;
};

const getStatus = (err: GraphQLError | null): number | null => {
  if (err && 'status' in err) return err.status as number;
  return null;
};

const errorLink = onError(({ graphQLErrors = [], networkError = {} }) => {
  let statusCode = getStatusCode(networkError);
  console.log({ networkError });
  const redirect = !!statusCode || (graphQLErrors && graphQLErrors.length > 0);
  if (redirect) {
    if (!statusCode) {
      const errors = graphQLErrors.filter(e => {
        const status = getStatus(e as GraphQLError);
        return status === 403 || status === 401 || status === 422;
      });
      const status = (errors[0] && getStatus(errors[0] as GraphQLError)) ?? 200;
      statusCode = status;
    }
    if (statusCode === 401) {
      console.warn(`You've attempted to access ${UNAUTHORIZED} section`);
      if (![LOGIN, SIGNUP].includes(history?.state?.location?.pathname)) {
        history.navigate(LOGIN);
      }
    }
    if (statusCode === 403) {
      console.warn(`You've attempted a ${FORBIDDEN} action`);
      // history.navigate('/error-page/403');
    }

    if (statusCode === 404) {
      console.warn(`Server for authentication not found`);
      history.navigate('/error-page/403');
    }

    if (statusCode === 422) {
      const transformedErrors = graphQLErrors?.reduce(
        (obj: GraphQLFormattedError, error: GraphQLFormattedError) => {
          if (getStatus(error as GraphQLError) !== 422) return obj;
          const { extensions: { fields } = {} } = error;
          return {
            ...obj,
            ...(fields as object),
          };
        },
        {} as GraphQLFormattedError
      );
      if (networkError && 'message' in networkError) {
        const msgObj: GraphQLFormattedError = transformedErrors;
        if (Object.keys(msgObj)?.length)
          networkError.message = JSON.stringify(msgObj);
      }
      // Object.assign(networkError, transformedErrors);
      if (networkError && 'graphQLErrors' in networkError)
        networkError.graphQLErrors = graphQLErrors;
      if (
        (networkError && !networkError.message) ||
        !Object.keys(transformedErrors || {}).length
      )
        toast.error('Ops, something went wrong!');
    }

    if (statusCode && statusCode >= 500) {
      console.warn('SERVER ERROR');
      history.navigate(`/error-page/${statusCode}`);
    }
  }
});

let links = [
  errorLink,
  CRUNCH && CRUNCH.USE ? ApolloLink.concat(uncruncher, httpLink) : httpLink,
];

if (useLocalStorage) {
  links = [
    errorLink,
    afterwareLink,
    authMiddlewareLink,
    CRUNCH && CRUNCH.USE ? ApolloLink.concat(uncruncher, httpLink) : httpLink,
  ];
}

const link = ApolloLink.from(links);

const client = new ApolloClient({
  link,
  cache: apolloCache,
  connectToDevTools: true,
});

const resetLocalStorageTokens = async (): Promise<void> => {
  return new Promise(resolve => {
    localStorage.removeItem(JWT.LOCAL_STORAGE.TOKEN.NAME);
    localStorage.removeItem(JWT.LOCAL_STORAGE.REFRESH_TOKEN.NAME);
    resolve();
  });
};

if (useLocalStorage) {
  client.onClearStore(() => resetLocalStorageTokens());
  client.onResetStore(() => resetLocalStorageTokens());

  let currentToken = window.localStorage.getItem(JWT.LOCAL_STORAGE.TOKEN.NAME);

  window.onstorage = () => {
    const newToken = window.localStorage.getItem(JWT.LOCAL_STORAGE.TOKEN.NAME);

    if (currentToken && !newToken) {
      // someone in another tab logged out while I am logged in here
      currentToken = newToken;
      setTimeout(() => {
        history.navigate(LOGIN, { replace: true });
      }, 0);
    } else if (!currentToken && newToken) {
      // I am not logged in, but someone else just logged in in another tab
      currentToken = newToken;
      setTimeout(() => {
        history.navigate('/', { replace: true });
      }, 0);
    } else if (currentToken && newToken && currentToken !== newToken) {
      // I am logged in and received a new token in local storage
      const currentTokenData = decode<{
        user: { [key: string]: Record<string, any> };
      }>(currentToken);
      const newTokenData = decode<{
        user: { [key: string]: Record<string, any> };
      }>(newToken);
      if (currentTokenData?.user?.id !== newTokenData?.user?.id) {
        // id(s) are different, thus someone in another tab logged in with different user while I was logged in with another user here
        // thus refresh the page to sync the user and view the new data
        window.location.reload();
      }
      // otherwise, I am logged in and received a new token in local storage
      // but it's the same user, so I don't need to do anything
      // it's standard behavior for refreshing tokens
    }
  };
}

export default client;
