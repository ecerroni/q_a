import { roles } from "~/directives";
export const mutationTypes = `
  type Mutation {
    addQA(input: addQAInput!): QA @${roles.is.user}
    updateQA(input: updateQAInput!): QA @${roles.is.user}
    deleteQAById(_id: ObjectID!): QA @${roles.is.user}
    suggestAiAnswer(question: String!): String @${roles.is.user}
  }
`;

export const mutationResolvers = {
  Mutation: {
    addQA: async (_, args, { user, dataSources }) => {
      const { question, answer } = args?.input ?? {};
      const userId = user?.id;
      if (!question || !answer || !userId) return null;
      return dataSources.QA.save({
        ...args.input,
        user: userId,
      });
    },

    updateQA: async (_, args, { user, dataSources }) => {
      const { _id, question, answer } = args?.input ?? {};
      const userId = user?.id;
      if (!_id || !question || !answer || !userId) return null;
      return dataSources.QA.update({
        ...args.input,
        user: userId,
      });
    },

    deleteQAById: async (_, args, { dataSources }) => {
      const { _id } = args ?? {};
      if (!_id) return null;
      return dataSources.QA.deleteById(_id);
    },

    suggestAiAnswer: async (_, args, { dataSources }) => {
      const { question } = args ?? {};
      if (!question) return null;
      return dataSources.OpenAI.getAnswer(question);
    },
  },
};
