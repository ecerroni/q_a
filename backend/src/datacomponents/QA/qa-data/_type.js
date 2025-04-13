export const types = `
  type QA {
    _id: ObjectID
    question: String
    answer: String
    createdBy: User
  }
`;

export const typeResolvers = {
  QA: {
    createdBy: ({ user }, _, { dataSources }) => dataSources.User.loadOne(user),
  },
};
