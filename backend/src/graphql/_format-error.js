import { ApolloError } from "apollo-server-errors";
import { v4 } from "uuid";
import { defaultErrorFormatter } from "mercurius";
import { formatError as formatErrorGraphql, GraphQLError } from "graphql";
import { FORBIDDEN, UNAUTHORIZED, isProduction, ERROR } from "~/environment";
import { log as logger } from "~/utils";

const validationErrors = [
  ERROR.USER.BAD_USER_INPUT,
  "ERR_GRAPHQL_YUP_VALIDATION",
  "MER_VALIDATION_ERR_FAILED_VALIDATION",
];

const loginErrors = [
  ERROR.USER.WRONG_CREDENTIALS,
  ERROR.USER.WRONG_PASSWORD,
  ERROR.USER.DOES_NOT_EXIST,
];

const e401s = [UNAUTHORIZED];

const e403s = [FORBIDDEN];

const WHITELISTED_ERRORS = [];

const errorKeys = [
  ...Object.entries(ERROR.USER).map(([k, v]) => ({ value: v, key: k })),
  { value: UNAUTHORIZED, key: "UNAUTHORIZED" },
  { value: FORBIDDEN, key: "FORBIDDEN" },
];
// export const formatError = (err, response) => {
export const formatError = (err, ctx) => {
  // eslint-disable-line

  let customError;

  let errors = [{ message: err.message }];
  let log;

  if (ctx) {
    // There is always app if there is a context
    log = ctx.reply ? ctx.reply.log : ctx.app.log;
  }
  if (err.errors) {
    errors = err.errors
      // eslint-disable-next-line
      .map(err => {
        let error = err;
        if (log) {
          log.error({ err: error }, error.message);
        }
        const maskError =
          !(error.originalError instanceof ApolloError) &&
          !e401s.includes(err.message) &&
          !loginErrors.includes(err.message) &&
          !e403s.includes(err.message) &&
          !WHITELISTED_ERRORS.includes(err.message);
        if (isProduction && maskError) {
          const errId = v4();
          const identifier = `[ERROR][Log id] ${errId}`;
          logger.error(error, identifier);
          return new GraphQLError(identifier);
        } else
          log.error(
            error,
            `[ERROR][${errorKeys.find(e => e.value === err.message)?.key ??
              "UNKOWN"}] ${err.message}`,
          );

        // Possible error codes
        // console.log({
        //   originalErrorCode: error.originalError?.code,
        //   errorExtensionCode: error.extensions?.code,
        //   message: error.message,
        // })

        if (e401s.includes(err.message)) {
          // We need this response status in the apollo client afterware
          error = {
            message: err.message,
            status: 401,
            location: err.location,
            path: err.path,
            extensions: {
              code: err.extensions?.code,
            },
          }; // thus set the status in the error
        }
        if (e403s.includes(err.message)) {
          // We need this response status in the apollo client afterware
          error = {
            message: err.message,
            status: 403,
            location: err.location,
            path: err.path,
            extensions: {
              code: err.extensions?.code,
            },
          }; // thus set the status in the error
        }

        if (validationErrors.includes(error.extensions?.code)) {
          // We need this response status in the apollo client afterware
          error = {
            message: err.message,
            status: 422,
            location: err.location,
            path: err.path,
            extensions: {
              ...err.extensions,
              code: err.extensions?.code,
            },
          }; // thus set the status in the error
        }

        if (error.status) {
          customError = error;
          return error;
        }
        return error instanceof GraphQLError
          ? formatErrorGraphql(error)
          : { message: error.message };
        // as the result of the outer map could potentially contain arrays with federated errors
        // the result needs to be flattened
      })
      .reduce((acc, val) => acc.concat(val), []);
  }
  // console.log({ customError })
  if (customError)
    return {
      statusCode: customError.status,
      response: {
        data: err.data || null,
        errors: [customError],
      },
    };
  // console.log({ errors: JSON.stringify(errors, null, 2) })

  const formatter = defaultErrorFormatter(err, ctx);

  // your custom behaviour here

  return {
    statusCode: formatter.statusCode || 500,
    response: formatter.response,
  };
};
