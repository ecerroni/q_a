import { roles } from "~/directives";
import { buildQueryParams } from "~/utils";

export const queryTypes = `
  type Query {
   listOwnQA(params: InputQueryParams!): [QA] @${roles.is.user}
  }
`;

export const queryResolvers = {
  Query: {
    listOwnQA: async (_, args, { user, dataSources }) => {
      const documents = await dataSources.QA.getMany({
        ...buildQueryParams({
          ...args,
          params: {
            ...args.params,
          },
        }),
        user: user?.id,
      });
      return documents;
    },
  },
};
