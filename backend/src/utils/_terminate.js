import { db } from "~/dataconnectors";
import sources from "~/dataconnectors/db/_db-sources";
import { log as logger } from "./logger";

const terminate = (server, options = { coredump: false, timeout: 500 }) => {
  // Exit function
  const exit = code => {
    if (options.coredump) {
      process.abort();
    } else {
      process.exit(code);
    }
  };

  const log = async (code, reason, err) => {
    const isError = err && err instanceof Error;
    const errorLevel = {
      type: isError ? "error" : "fatal",
      label: isError ? "[ERROR][ROOT]" : "[FATAL][ROOT]",
    };

    try {
      await logger.ensure.error(
        {
          reason,
          code: err?.code || code,
          message: err?.message,
          stack: err?.stack,
        },
        errorLevel.label,
      );

      const isMultiMongoConnection = !db.default && !db.connections;
      if (!isMultiMongoConnection) {
        await db?.close?.();
      } else {
        const modelNames = Object.keys(sources);
        for (const model of modelNames) {
          if (db[model]) {
            await db[model].close();
          } else if (db.Relationship) {
            await db.Relationship.close();
          }
        }
      }

      // Close the server and exit after the timeout
      server.close(exit);
      setTimeout(exit, options.timeout).unref();
    } catch (loggingError) {
      console.error("Error during logging:", loggingError);
      exit(code);
    }
  };

  return (code, reason) => async (err, promise) => {
    // Attempt a graceful shutdown
    await log(code, reason, err);
  };
};

export default terminate;
