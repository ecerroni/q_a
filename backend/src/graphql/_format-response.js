import { crunch } from "graphql-crunch";
import {
  setCookies,
  setHeaders,
  unsetCookies,
  selectAuthStrategy,
} from "~/authentication";
import { CRUNCH } from "$/settings/queries.json";

import ROUTES_RESOLVERS from "$/settings/routes-resolvers.json";

const {
  SERVER: {
    RESOLVERS: { WITH_TOKEN_HEADERS: login } = {},
    ROUTES: { LOGOUT: logout } = {},
  } = {},
} = ROUTES_RESOLVERS;

export const formatResponse = async (
  { data, errors },
  { reply, req: request },
) => {
  if (data && reply) {
    const operationNames = data && Object.keys(data);
    const { headers = {} } = request || {};
    const isLogout = operationNames?.includes(logout);
    const isLogin =
      data &&
      operationNames &&
      login.findIndex(l => operationNames?.includes(l)) > -1;

    if (isLogout) {
      const [httpOnly] = selectAuthStrategy(headers);
      if (httpOnly) {
        unsetCookies(reply);
      }
    }
    if (isLogin) {
      operationNames.forEach(function op(operationName) {
        if (login.includes(operationName) && data[operationName]) {
          const [httpOnly, localStorage] = selectAuthStrategy(headers);
          const { token, refreshToken } = JSON.parse(data[operationName]);
          if (httpOnly) {
            setCookies(reply, token, refreshToken);
          }
          if (localStorage) {
            setHeaders(reply, token, refreshToken);
          }
        }
      });
    }
  }

  // Can't figure out how to set headers in handle-authentication when res is coming from Middie
  // Workaround
  if (request.raw?.addHeader?.length) {
    const [httpOnly, localStorage] = selectAuthStrategy(request.headers);
    const [token, refreshToken] = request.raw.addHeader;
    if (httpOnly) {
      setCookies(reply, token, refreshToken);
    }
    if (localStorage) {
      setHeaders(reply, token, refreshToken);
    }
  }

  // CRUNCH
  if (CRUNCH?.USE) {
    const clientQuery = request.query;
    if (clientQuery.crunch && data) {
      const version = parseInt(clientQuery.crunch, 10) || 1;
      reply.send({
        data: crunch(data, version),
        ...(errors?.length && { errors }),
      });
    }
  }
};
