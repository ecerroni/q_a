export default (args = {}, params = "params") => {
  const { [params]: { limit = 999, skip = 0, ...rest } = {} } = args || {};
  return {
    ...(limit && limit !== -1 && { limit }),
    skip,
    ...rest,
    ...(rest.where && {
      where: {
        ...rest.where,
      },
    }),
  };
};
