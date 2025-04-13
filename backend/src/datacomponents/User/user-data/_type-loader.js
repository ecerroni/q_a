export const typeLoaders = {
  // User: {
  //   // async is mandatory
  //   // both the typeLoader and the typeResovler for a specific field will be executed
  //   // However, if both are defined for the same field the returned value will be from the typeLoader.
  //   // Hints:
  //   // - Use either a typeLoader or a typeResolver for a specific field
  //   // - typeLoaders are best when you use dataMemo or API datasources
  //   // - for DB datasources and other things you can safely use typeResolvers
  //   async bestFriend(queries, { dataSources, dataMemo }) {
  //     return queries.reduce(async (arr, { obj }) => {
  //       const values = await arr;
  //       await dataMemo.User.sample(1);
  //       const randomUser = await dataSources.Sample.getRandomUser();
  //       return [...values, { ...randomUser, _id: randomUser.id }];
  //     }, []);
  //   },
  //   // role: async queries => queries.map(q => null),
  //   async peer(queries, { dataMemo, dataLoaders }) {
  //     return queries.reduce(async (arr, { obj }) => {
  //       const values = await arr;
  //       // await dataMemo.User.sample(1)
  //       const peers = await dataLoaders.User.loadManyByQuery(
  //         {
  //           name: "Enrico",
  //         },
  //         { maxTtl: 10 * 1000 },
  //       );
  //       return [...values, peers[0]];
  //     }, []);
  //   },
  // },
};
