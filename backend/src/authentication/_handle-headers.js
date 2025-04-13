import { JWT } from "~/config";

export const setCookies = (res, newToken, newRefreshToken) => {
  res
    .setCookie(JWT.COOKIE.TOKEN.NAME, newToken, JWT.COOKIE.TYPE)
    .setCookie(JWT.COOKIE.REFRESH_TOKEN.NAME, newRefreshToken, JWT.COOKIE.TYPE);
};

export const unsetCookies = response =>
  response
    .clearCookie(JWT.COOKIE.TOKEN.NAME, JWT.COOKIE.TYPE)
    .clearCookie(JWT.COOKIE.REFRESH_TOKEN.NAME, JWT.COOKIE.TYPE);

export const setHeaders = (res, newToken, newRefreshToken) => {
  res.header(JWT.HEADER.TOKEN.NAME, newToken);
  res.header(JWT.HEADER.REFRESH_TOKEN.NAME, newRefreshToken);
};
