import { ErrorWithProps } from "mercurius";
import translate from "translate-js";
import { ERROR } from "~/environment";
import { log } from "../logger";

const errorCodes = {
  11000: "already exists",
};

const useCustomMessage = params => {
  const { code, keyValue, errors = {}, locale } = params || {};
  let message;
  if (Object.keys(errors).length)
    message = Object.entries(errors).reduce((o, [k, v]) => {
      return {
        ...o,
        [k]: { message: v?.properties?.message } ?? {
          message: translate(
            "errors.mongo.input.undefined",
            { value: v?.value },
            { locale },
          ),
        },
      };
    }, {});
  if (message) return message;
  message = {
    general: translate("errors.mongo.input.general", null, { locale }),
  };
  if (!errorCodes[code] || !keyValue) return message;
  message = Object.entries(keyValue || {})?.reduce(
    (obj, [k, v]) => ({
      ...obj,
      [k]: { message: `${k} ${v} ${errorCodes[code]}` },
    }),
    {},
  );
  return message;
};

export default (err, locale) => {
  // NOTE: this has been tested only with duplicates of native mongoose dup errors
  // and custom uniquenessValidator helper
  if (!err) return;
  const { code, keyValue } = err || {};
  let { errors = {} } = err || {};

  if (!Object.keys(errors).length && typeof err.message === "string") {
    log.dev(`Error isString ${typeof err.message === "string"}`);
    // It is validator/update
    errors = err.message.replace("ValidationError: ", "").split(",");
    errors = errors.reduce((obj, e) => {
      const parts = e.split(":");
      if (parts.length < 2) return obj;
      const rawMessage = parts[1].trim();
      const [value, code] = rawMessage.split("___");
      let message = rawMessage;
      if (code)
        message = translate(
          `errors.mongo.input.${code}`,
          { value },
          { locale },
        );
      return {
        ...obj,
        [parts[0].trim()]: {
          // reconstruct the error fiels as in native validator/create
          properties: {
            message,
          },
        },
      };
    }, {});
  } // else is validator/create
  // TODO: [rico] Missing translation implementation for validator/create
  throw new ErrorWithProps(ERROR.USER.BAD_USER_INPUT, {
    code: ERROR.USER.BAD_USER_INPUT,
    status: 422,
    fields: { ...useCustomMessage({ code, keyValue, errors, locale }) },
  });
};
