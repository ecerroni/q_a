export const queryTypes = `
  type Query {
    ping: String
    connection: String!
    _checkAuth: String
  }
`;

// NOTE:
// Keep in mind  that "_checkAuth: String!  @${roles.is.admin}" if not allowed would also throw
// TypeError: Cannot convert undefined or null to object
// when using non nullable objects

export const queryResolvers = {
  Query: {
    ping: () => "Server is up and running... working smoothly",
    connection: () => "Connected",
    _checkAuth: (_, args, context) => {
      return `Authorized | CurentUserId ${context.user.id}!`;
    },
  },
};
