export const queryTypes = `
  type Query {
    currentUser: User
    users: [User]
  }`;
export const queryResolvers = {
  Query: {
    currentUser: (_, __, { user, dataSources }) => {
      if (!user) return null;
      return dataSources.User.getById(user?.id);
    },
    users: (_, __, { dataSources }) => dataSources.User.getMany(),
  },
};
