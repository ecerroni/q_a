import { AUTH } from "~/config";
import { isProduction, isDevelopment, isTesting } from "~/environment";
import { log } from "~/utils";

const localAuthCheck = () =>
  AUTH.ENDPOINT === "localhost" ||
  AUTH.ENDPOINT === "127.0.0.1" ||
  AUTH.ENDPOINT === "0.0.0.0";

export const startupMessages = ({
  endpoint = "http://localhost",
  port,
  graphiql = "/graphql",
  graphql = "graphql",
}) => {
  if (
    typeof AUTH.SECRET_TOKEN === "undefined" ||
    typeof AUTH.SECRET_REFRESH_TOKEN === "undefined"
  ) {
    console.warn(`[WARNING]: NOT ALL ENV SECRETS HAVE BEEN PROVIDED. Check README.md
      for more information`);
  } else {
    log.info("[SERVER][INFO]: AUTH SECRETS HAVE BEEN PROVIDED");
    if (typeof AUTH.ENDPOINT === "undefined") {
      console.warn(
        "[WARNING]: process.env.API_AUTH_ENDPOINT is not defined. Check README.md for more information",
      );
    } else {
      log.info(`[SERVER][INFO]: AUTH ENDPOINT = ${AUTH.ENDPOINT}`);
      const authLocation = localAuthCheck() ? "THIS ONE" : "EXTERNAL";
      log.info(`[SERVER][INFO]: AUTH SERVER IS ${authLocation}`);
      log.info("[SERVER][INFO]: ALL SET >> SERVER CONFIGURATION READY");
    }
  }
  log.info(
    `[SERVER][INFO]: 🚀  GraphQL Server is now running on ${endpoint}:${port}${graphql} 🚀`,
  );

  log.info(`[SERVER][INFO]: View GraphiQL at ${endpoint}:${port}${graphiql}`);
  /* eslint-disable no-nested-ternary */
  log.terminal(
    `[ENVIRONMENT][INFO]: ${
      isProduction
        ? "PRODUCTION"
        : isTesting
        ? "TESTING"
        : isDevelopment
        ? "DEVELOPMENT"
        : "n/a"
    } (process.env.NODE_ENV is ${process.env.NODE_ENV})`,
  );
};
