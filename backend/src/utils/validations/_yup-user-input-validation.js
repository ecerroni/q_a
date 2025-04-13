import { ErrorWithProps } from "mercurius";
/* eslint-disable no-nested-ternary */
// const formatMessage = (errors = []) =>
//   !errors.length
//     ? "Error encountered."
//     : errors.length === 1
//     ? `${errors[0]}.`
//     : `${errors.length} Errors: ${errors
//         .map((e, i) => `${i + 1}) ${e}.`)
//         .join(" ")}`;

const validate = (schema, resolver) => async (_, args, context, info) => {
  try {
    const validated = await schema.validate(args, {
      abortEarly: false,
    });
    return resolver(_, validated, context, info);
  } catch (error) {
    throw new ErrorWithProps(error?.message || "Validation Error", {
      code: "ERR_GRAPHQL_YUP_VALIDATION",
    });
  }
};

export default (schema, resolver) => validate(schema, resolver);
