import Fastify from "fastify";
import path from "path";
import mercurius from "mercurius";
import mercuriusValidation from "mercurius-validation";
import { NoSchemaIntrospectionCustomRule } from "graphql";
import middie from "middie";
import cookies from "@fastify/cookie";
import costAnalysis from "graphql-cost-analysis";
import { handleAuthentication } from "~/authentication";
import {
  context as buildContext,
  formatResponse,
  formatError as errorFormatter,
} from "~/graphql";
import "~/lang";
import { schema } from "~/schema";
import {
  SERVER,
  DEPTH_LIMIT as QUERY_DEPTH_LIMIT,
  MAX_COST as QUERY_MAX_COST,
} from "~/config";
import {
  startupMessages,
  RESPONSE,
  isDevelopment,
  isTesting,
  isProduction,
} from "~/environment";
import { db, init } from "~/dataconnectors";
import { mockDb } from "./mocks";
import { feedDb } from "./seed";
import datasources from "./datasources";
import components from "./datacomponents";
import { terminate, log, loadModule } from "./utils";
//  TODO: add-ons
// import mercuriusLogging from 'mercurius-logging'

const start = async () => {
  const explain = await loadModule("mercurius-explain");
  const explainGraphiQLPlugin = explain?.explainGraphiQLPlugin;
  await init();
  const dataSources = await datasources(db);

  await mockDb(db);

  await feedDb(db);

  const app = Fastify();

  await app.register(middie);

  app.use(handleAuthentication);

  app.register(cookies, {
    secret: "my-secret", // for cookies signature
    parseOptions: {}, // options for parsing cookies
  });
  app.register(mercurius, {
    graphiql: false,
    ide: false,
    // path: SERVER.GRAPHQL,
    schema,
    path: `${SERVER.GRAPHQL}:*`,
    context: (req, res) => buildContext({ res, req, dataSources }),
    errorFormatter,
    loaders: components.loaders
      .filter(l => !!l)
      .reduce((o, l) => ({ ...o, ...l }), {}),
    queryDepth: QUERY_DEPTH_LIMIT,
    ...(isDevelopment && {
      graphiql: {
        enabled: true,
        plugins: [explainGraphiQLPlugin()],
      },
    }),
    jit: isProduction ? 1 : 0,
    cache: false,
    validationRules: req => [
      ...(isProduction ? [NoSchemaIntrospectionCustomRule] : []),
      // ref: https://github.com/pa-bru/graphql-cost-analysis
      // TODO: get this back when the follwing issue is solved
      // https://github.com/pa-bru/graphql-cost-analysis/issues/12
      costAnalysis({
        variables: req.variables,
        maximumCost: QUERY_MAX_COST,
        defaultCost: 1,
        ...(isDevelopment && {
          onComplete: costs =>
            log.info(`Query costs: ${costs} (max: ${QUERY_MAX_COST})`),
        }),
      }),
    ],
  });

  app.register(explain, {
    enabled: ({ schema, source, context }) => {
      // [NOTE]: add more constraints if necessary
      return context.reply.request.headers["x-mercurius-explain"];
    },
  });
  app.register(mercuriusValidation);
  app.register(require("mercurius-hit-map"));

  // Other

  app.register(require("@fastify/static"), {
    root: path.join(__dirname, "resources"),
    prefix: "/", // optional: default '/'
  });

  app.get(
    "/schema",
    { constraints: { host: "localhost:9000" } },
    (req, reply) => {
      reply.sendFile("voyager/index.html");
    },
  );

  app.get("/docs", (req, reply) => {
    reply.sendFile("docs/index.html");
  });

  app.get("/hit", async () => {
    const hitMap = await app.getHitMap();
    return hitMap;
  });

  app.get("/", (_, reply) => {
    reply.raw.writeHead(200, {
      Connection: "close",
      "X-Powered-By": "Fastify/Mercurius",
    });
    reply.raw.write(RESPONSE.MESSAGES.UP_RUNNING);
    return reply.raw.end();
  });

  await app.ready();

  app.graphql.addHook("onResolution", formatResponse);

  const { PORT, GRAPHQL, GRAPHIQL, PROTOCOL, HOST } = SERVER;
  const actualPort = isTesting ? 3000 : PORT; // testing port is always 3000
  app.listen(
    { port: actualPort, ...(isProduction && { host: "0.0.0.0" }) },
    (err, address) => {
      log.info({ address, ...(err && { err }) });
      startupMessages({
        port: actualPort,
        graphql: GRAPHQL,
        graphiql: GRAPHIQL,
        endpoint: `${PROTOCOL}://${HOST}`,
      });
      console.log("[INFO] [SERVER] READY!", address);
    },
  );
  const exitHandler = terminate(app, {
    coredump: false,
    timeout: 500,
  });

  process.on("uncaughtException", exitHandler(1, "Unexpected Error"));
  process.on("unhandledRejection", exitHandler(1, "Unhandled Promise"));
  process.on("SIGTERM", exitHandler(0, "SIGTERM"));
  if (!isTesting) process.on("SIGINT", exitHandler(0, "SIGINT"));
};

start();
