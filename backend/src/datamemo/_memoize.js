import memoize from "fast-memoize";
import { isProduction } from "~/environment";
import { storageAdapter } from "~/config";

// function ObjectWithoutPrototypeCache() {
//   console.log(
//     Object.keys(storageAdapter.opts.store.cache),
//     storageAdapter.opts.store.cache.get(),
//   )
//   this.cache = storageAdapter.opts.store.cache
// }

// ObjectWithoutPrototypeCache.prototype.has = function(key) {
//   return this.cache.has(key)
// }

// ObjectWithoutPrototypeCache.prototype.get = async function(key) {
//   console.log(
//     'get',
//     Object.keys(this.cache.opts.store),
//     this.cache.opts.store._size,
//     await this.cache.get(key),
//   )
//   return this.cache.get(key)
// }

// ObjectWithoutPrototypeCache.prototype.set = async function(key, value) {
//   console.log(this.cache.set.toString())
//   this.cache.set(key, value)
// }

// const memoizeCache = new ObjectWithoutPrototypeCache()

// cache for fast-memoize
const cache = {
  create: function create() {
    return storageAdapter.memo;
  },
};

export default fn =>
  memoize(fn, {
    strategy: memoize.strategies.variadic,
    cache,
    debug: !isProduction,
  });
