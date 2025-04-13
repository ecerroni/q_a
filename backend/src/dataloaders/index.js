import { storageAdapter } from "~/config";
import { db } from "~/dataconnectors";
import apiSources from "~/datasources/api";
import { useExperimentalConnection, isProduction } from "~/environment";
import { createCachingMethods } from "./_caching-methods";

const apiSourcesNames = Object.keys(apiSources);

// const modelNames = Object.keys(sources)
// console.log({modelNames});
const cache = storageAdapter.db;
const config = {
  debug: !isProduction,
  allowFlushingCollectionCache: true,
};
const { debug, allowFlushingCollectionCache } = config;
export default dataSourcesNames => {
  // build data loaders only for db sources
  const modelNames = dataSourcesNames.filter(
    dsName => !apiSourcesNames.includes(dsName),
  );
  return {
    ...modelNames.reduce((obj, name) => {
      const connection = useExperimentalConnection ? db[name] : db;
      const methods = createCachingMethods({
        collection: connection.models[name],
        cache,
        debug,
        allowFlushingCollectionCache,
      });
      return {
        ...obj,
        [name]: methods,
      };
    }, {}),
  };
};
