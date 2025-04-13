import jwt from "jsonwebtoken";
import { AUTH, JWT, APP } from "~/config";
import { selectAuthStrategy } from "~/authentication";
import { refreshTokens } from "./_handle-tokens";
import { setCookies, setHeaders } from "./_handle-headers";

const getCookie = (src, name) => {
  const value = `; ${src}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(";")
      .shift();
  return null;
};

// Inspired by: benawad https://github.com/benawad/slack-clone-server/blob/13_where/index.js
export const handleAuthentication = async (req, res, next) => {
  req.user = undefined;
  let token;
  let refreshToken;
  const [httpOnly, localStorage] = selectAuthStrategy(req.headers);

  if (httpOnly) {
    token = getCookie(req.headers.cookie, JWT.COOKIE.TOKEN.NAME);
    refreshToken = getCookie(req.headers.cookie, JWT.COOKIE.REFRESH_TOKEN.NAME);
  }

  if (localStorage) {
    token = req.headers[JWT.HEADER.TOKEN.NAME];
    refreshToken = req.headers[JWT.HEADER.REFRESH_TOKEN.NAME];
  }

  req.app_version = req.headers[`x-${APP.NAMESPACE}-version`];

  if (token) {
    try {
      const { user } = jwt.verify(token, AUTH.SECRET_TOKEN);
      req.user = user;
    } catch (err) {
      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
      } = await refreshTokens(refreshToken);
      if (newToken && newRefreshToken) {
        if (httpOnly) {
          // setCookies(res, newToken, newRefreshToken)
          req.addHeader = [newToken, newRefreshToken];
        }

        if (localStorage) {
          // Can't figure out how to set headers of this res I am getting from Middie
          // setHeaders(res, newToken, newRefreshToken)
          // Workaround
          req.addHeader = [newToken, newRefreshToken];
        }
      }
      req.user = user;
    }
  }
  next();
};
