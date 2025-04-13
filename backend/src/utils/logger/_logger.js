import pino from "pino";
import { createWriteStream } from "pino-http-send";
import { isProduction } from "~/environment";

let logger;

const httpLogServerUrl = process.env.API_HTTP_LOG_SERVER_URL ?? null; //"http://localhost:8686/v1/log";

if (!!httpLogServerUrl) {
  console.log("[INFO] [LOGS] Streaming logs to ", httpLogServerUrl);
  const stream = createWriteStream({
    method: "POST",
    url: `${httpLogServerUrl}`, // Variable should have a value similar to http://vector-host:8686/v1/log
    headers: { "Content-Type": "application/json" },
  });

  // To be used with FATAL errors and Unexpected Exceptions
  const syncStream = createWriteStream({
    method: "POST",
    url: `${httpLogServerUrl}`, // Variable should have a value similar to http://vector-host:8686/v1/log
    headers: { "Content-Type": "application/json" },
    timeout: 0,
    interval: 0,
  });

  const app = process.env.API_AUTH_ENDPOINT ?? "unknown";
  logger = pino(
    {
      level: "info", // Set the default log level
      base: { app }, // Add default properties to every log message
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: label => {
          return { tag: label?.toUpperCase?.() ?? "UNKOWN" };
        },
        // log(object) {
        //   // do something
        //   return {
        //    object
        //   };
        // },
      },
    },
    stream,
    // other transports
    // pino.transport({
    // targets: [
    //     {
    //       target: "pino/file",
    //       options: {
    //         destination: "/var/log/vector/logs.log",
    //       },
    //     },
    //     {
    //       target: "pino/file",
    //       level: "warn",
    //       options: {
    //         destination: "/var/log/vector/warn.log",
    //       },
    //     },
    //     {
    //       target: "pino/file",
    //       level: "error",
    //       options: {
    //         destination: "/var/log/vector/errors.log",
    //       },
    //     },
    //   ],
    // }),
  );
  logger.ensure = pino({
    base: { app }, // Add default properties to every log message
    timestamp: pino.stdTimeFunctions.isoTime,

    transport: {
      targets: [
        {
          level: "error", // Set the default log level
          target: "./_custom-http-transport.mjs",
          options: {
            url: httpLogServerUrl,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          },
        },
      ],
    },
  });
} else {
  console.log("[INFO] [LOGS] Logging to console terminal");
  // Create a console logger for development
  logger = {
    info: console.log.bind(console, "[INFO]"),
    warn: console.warn.bind(console, "[WARN]"),
    error: console.error.bind(console, "[ERROR]"),
    debug: console.debug.bind(console, "[DEGUG]"),
    trace: console.trace.bind(console, "[TRACE]"),
    fatal: console.error.bind(console, "[FATAL]"),
    console: true,
  };
  logger.ensure = logger;
}
logger.dev = isProduction ? () => null : console.log.bind(console, "[DEV]");
// log terminal logs in console first and if the ingegtion endpoint exists
// it also send the same log to it
logger.terminal = logger.console
  ? console.log.bind(console, "[INFO]")
  : (...args) => {
      console.log("[INFO]", ...args);
      logger.info(...args);
    };

// Export the logger
export default logger;
