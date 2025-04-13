import mongoose from "mongoose";
import { isTesting, useExperimentalConnection } from "~/environment";
import { log } from "~/utils";
import sources from "./_db-sources";
let db;
const init = async () => {
  const modelNames = [...Object.keys(sources), "Relationship"];

  const mongoUri = process.env.API_DB_CONNECTION_STRING;

  const connectionOptions = {
    // autoReconnect: true,
    // reconnectTries: 1000000,
    // reconnectInterval: 3000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // poolSize,
  };

  const connections = modelNames.reduce(
    (obj, name) => ({
      ...obj,
      [name]: null,
    }),
    { default: null },
  );

  // const poolSize = process.env.MONGO_POOL_SIZE || 5;

  const connectionFn = (uri, name) => {
    connections[name] = mongoose.createConnection(uri, connectionOptions);
  };

  const initiMongoose = async (uri = mongoUri, name = "default") => {
    connectionFn(uri, name);

    mongoose.pluralize(null);
    connections[name].on("connected", () => {
      log.info(`[MONGO] ${name} Connection Established`);
      log.info(`[MONGO] ${name} Connected to db`);
    });

    connections[name].on("reconnected", async () => {
      await log.ensure.info(`[MONGO][INFO] ${name} Connection Reestablished`);
    });

    connections[name].on("disconnected", async () => {
      await log.ensure.warn(`[MONGO] ${name} Connection Disconnected`);
    });

    connections[name].on("close", async () => {
      await log.ensure.info(`[MONGO] ${name} Connection Closed`);
    });

    connections[name].on("error", async error => {
      await log.ensure.error(`[MONGO] ${name} | ERROR: ${error}`);
    });
  };
  if (isTesting) {
    const { MongoMemoryServer } = require("mongodb-memory-server-core"); // eslint-disable-line
    mongoose.Promise = Promise;
    const mongoServer = new MongoMemoryServer({
      binary: {
        version: "4.0.3",
        downloadDir: "./tests/mongo-bin",
      },
    });
    await mongoServer.start();
    const uri = mongoServer.getUri();
    mongoose.connect(uri, connectionOptions);
  } else if (useExperimentalConnection) {
    modelNames.forEach(async function createConnection(name) {
      await initiMongoose(mongoUri, name);
    });
  } else await initiMongoose();

  const numberOfConnections = useExperimentalConnection ? modelNames.length : 1;
  log.terminal(`[MONGO]: CONNECTIONS USED ${numberOfConnections}`);
  db = isTesting
    ? mongoose
    : useExperimentalConnection
    ? connections
    : connections.default;
};
//console.log("[MONGO][INFO]: POOL SIZE PER CONNECTION", poolSize);
/* eslint-disable no-nested-ternary */

export { db, init };
