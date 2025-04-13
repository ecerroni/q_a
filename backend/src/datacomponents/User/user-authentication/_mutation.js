import base64 from "base-64";
import { UserHelper as User } from "~/datasources";
import { ERROR } from "~/environment";
import { createUserToken, hashString, throwIfError } from "~/utils";
import { SCOPES } from "~/config";

export const mutationTypes = `
  type Mutation {
    login(input: userCredentials): String
    loginCmsDashboard(input: userCredentials): String
    logout: String
  }
`;

export const mutationResolvers = {
  Mutation: {
    logout: () => "ok",
    login: async (_, { input }) => {
      const { username, password: encodedPassword } = input;
      // Decode the base64 string to perform any validation you need
      const password = decodeURIComponent(
        escape(base64.decode(encodedPassword)),
      );
      // The only reason we send encoded base64 string from the client
      // is to mask the password.
      // We do this not because of security, indeed it's very weak.
      // We do it instead to no show the plain password when inspecting
      // graphql passwords.
      // Clients are sensitive to these things even if they do not understand.

      // Hash the password before validating it. When users register or change their password its first hashed and then encrypted in the db
      const user = await User.validate(username, hashString(password).digest);
      if (user) {
        return createUserToken(user);
      }
      return null;
    },
    loginCmsDashboard: async (_, { input }) => {
      const { username, password: encodedPassword } = input;
      // Decode the base64 string to perform any validation you need
      const password = decodeURIComponent(
        escape(base64.decode(encodedPassword)),
      );
      // The only reason we send encoded base64 string from the client
      // is to mask the password.
      // We do this not because of security, indeed it's very weak.
      // We do it instead to no show the plain password when inspecting
      // graphql passwords.
      // Clients are sensitive to these things even if they do not understand.

      // Hash the password before validating it. When users register or change their password its first hashed and then encrypted in the db
      const user = await User.validate(username, hashString(password).digest);
      if (user) {
        const allowedRoles = [
          SCOPES.ROLES.OWNER.VALUE,
          SCOPES.ROLES.ADMIN.VALUE,
        ];
        if (allowedRoles.includes(user.role)) {
          return createUserToken(user);
        }
        throwIfError(ERROR.USER.WRONG_CREDENTIALS);
      }
      return null;
    },
  },
};
