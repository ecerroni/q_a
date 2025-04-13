import { ERROR } from "~/environment";
import { userInputValidation, forceBadUserInputErrorFor } from "./validations";

export default (error, message, opts) => {
  if (error) {
    if (message) {
      if (message === ERROR.USER.BAD_USER_INPUT) {
        const { force, field, message: value, language, locale } = opts || {};
        if (force) return forceBadUserInputErrorFor(field, value);
        return userInputValidation(error, language || locale);
      }
      throw new Error(message);
    }
    throw new Error(error);
  }
  return null;
};
