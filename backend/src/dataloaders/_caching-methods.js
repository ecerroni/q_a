import DataLoader from "dataloader";
import sift from "sift";
import mongoose from "mongoose";
import { log } from "~/utils";

const ObjectId = mongoose.Types.ObjectId;

function to(promise, errorExt) {
  return promise
    .then(data => [null, data])
    .catch(err => {
      if (errorExt) {
        Object.assign(err, errorExt);
      }

      return [err, undefined];
    });
}

export const idToString = id =>
  id instanceof ObjectId ? id.toHexString() : id;

const stringToId = str => (str instanceof ObjectId ? str : new ObjectId(str));

const handleCache = async ({ maxTtl, doc, key, cache }) => {
  let ttl = cache.opts?.ttl || cache.opts?.store?.duration; // this line is specific to keyv/map-expire combo
  ttl = maxTtl || ttl;
  if (Number.isInteger(ttl)) {
    cache.set(key, doc, ttl);
  }
};

const isValidObjectId = id => {
  const hex = /[0-9A-Fa-f]{6}/g;
  return (
    id !== null &&
    typeof id !== "undefined" &&
    hex.test(id) &&
    (hex.test(idToString(id)) || hex.test(stringToId(id)))
  );
};

const remapDocs = (docs, ids) => {
  const idMap = {};
  docs
    .filter(v => !!v && v._id) // eslint-disable-line no-underscore-dangle
    .forEach(doc => {
      idMap[idToString(doc._id)] = doc; // eslint-disable-line no-underscore-dangle
    });

  //   console.log({
  //     ids,
  //     docs,
  //     filter: ids.map(id => idMap[idToString(id)]).filter(v => !!v && v._id),
  //     idMap,
  //   });
  return ids.map(id => idMap[idToString(id)]);
};

// eslint-disable-next-line import/prefer-default-export
export const createCachingMethods = ({
  collection,
  cache,
  allowFlushingCollectionCache = false,
  debug = false,
}) => {
  const loader = new DataLoader(ids =>
    collection
      .find({ _id: { $in: ids.filter(v => !!v).map(stringToId) } })
      .lean()
      .then(docs => remapDocs(docs, ids)),
  );

  const cachePrefix = `db:mongo:${
    collection.collectionName // eslint-disable-line no-nested-ternary
      ? collection.collectionName
      : collection.modelName
      ? collection.modelName
      : "test"
  }:`;

  const dataQuery = ({ queries }) =>
    collection
      .find({ $or: queries })
      .lean()
      .then(items => queries.map(query => items.filter(sift(query))));

  const queryLoader = new DataLoader(queries => dataQuery({ queries }));

  const methods = {
    // eslint-disable-next-line no-param-reassign
    loadOneById: async (id, { maxTtl } = {}) => {
      const key = cachePrefix + id;

      // eslint-disable-next-line no-unused-vars
      const [_, cacheDoc] = await to(cache.get(key));
      if (debug) {
        log.dev(`[DB][CACHE][KEY] ${key} [${cacheDoc ? "HIT" : "MISS"}]`);
      }
      if (cacheDoc) {
        return cacheDoc;
      }

      const doc = isValidObjectId(id)
        ? await loader.load(idToString(id))
        : null;
      //   console.log({ doc, id }, isValidObjectId(id));
      await handleCache({
        maxTtl,
        doc,
        key,
        cache,
      });

      return doc;
    },

    // eslint-disable-next-line no-param-reassign
    loadManyByIds: (ids, { maxTtl } = {}) => {
      return Promise.all(
        ids
          .filter(id => isValidObjectId(id))
          .map(id => methods.loadOneById(id, { maxTtl })),
      );
    },

    // eslint-disable-next-line no-param-reassign
    loadManyByQuery: async (query, { maxTtl } = {}) => {
      const key = cachePrefix + JSON.stringify(query);

      const cacheDocs = await cache.get(key);
      if (debug) {
        log.dev(`[DB][CACHE][KEY] ${key} [${cacheDocs ? "HIT" : "MISS"}]`);
      }
      if (cacheDocs) {
        return cacheDocs;
      }
      const docs = await queryLoader.load(query);
      await handleCache({
        maxTtl,
        doc: docs,
        key,
        cache,
      });
      return docs;
    },

    // eslint-disable-next-line no-param-reassign
    deleteFromCacheById: async id => {
      const stringId = idToString(id);
      loader.clear(stringId);
      // await cache.delete(cachePrefix + stringId)
      const key = id && typeof id === "object" ? JSON.stringify(id) : id; // NEW
      await cache.delete(cachePrefix + key);
    }, // this works also for byQueries just passing a stringified query as the id

    // eslint-disable-next-line no-param-reassign
    flushCollectionCache: async () => {
      if (!allowFlushingCollectionCache) return null;
      await cache.clear();
      return "ok";
    },
  };
  return methods;
};
