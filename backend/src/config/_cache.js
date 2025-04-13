import Keyv from "keyv";
import Cache from "map-expire/MapExpire";

// require('events').EventEmitter.prototype._maxListeners = 100 // give keyv some room for extreme hitters
require("events").EventEmitter.prototype._maxListeners = 100; // give keyv some room for extreme hitters

export default {
  api: new Keyv({
    namespace: "keyv_api",
    // do not cache if not explicitily set on method, api should cache by response's cache control headers
    store: new Cache([], {
      capacity: 1000,
    }),
  }),
  db: new Keyv({
    namespace: "keyv_db",
    // a reasonable ttl to hold the value during the context execution request lifecycle.
    // Any specific cache expiration time should be set on the method itself using { maxTtl: <value_in_ms> }
    ttl: 1000,
    store: new Cache([], {
      capacity: 1000,
      // duration: 1000, // in millisecond, default expiration time
    }),
  }),
  memo: new Keyv({
    namespace: "keyv_memo",
    ttl: 1500, // memo are there only for the context execution
    store: new Cache([], {
      capacity: 100,
      // duration: 1000, // in millisecond, default expiration time
    }),
  }),
};
