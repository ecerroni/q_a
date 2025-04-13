import build from "pino-abstract-transport";

const LEVELS = {
  10: "TRACE",
  20: "DEBUG",
  30: "INFO",
  40: "WARN",
  50: "ERROR", // Including SIGINT handling here
  60: "FATAL",
};

export default async function(options = { url, username, apiToken, headers }) {
  /**
   * @type {Array<Promise>} Send tasks.
   */
  const tasks = [];
  return build(
    async source => {
      try {
        // We use an async iterator to read log lines.
        for await (let line of source) {
          const task = sendToHttp({
            url: options.url,
            username: options.username,
            apiToken: options.apiToken,
            headers: options.headers,
            line,
          });
          tasks.push(task);
        }
        return source;
      } catch (e) {
        console.log({ e });
      }
    },
    {
      parse: "lines",
      async close() {
        // Wait for all send tasks to complete.
        await Promise.all(tasks);
      },
    },
  );
}

function sendToHttp({ url, username, apiToken, line, headers }) {
  const logData = JSON.parse(line);
  logData.tag = LEVELS[logData.level] ?? "UNKOWN";
  // console.log({ logData });
  const logs = [logData]; // [[(logData.time * 1000000).toString(), logData.msg]];
  let body = {
    logs,
  };
  // adjust the body for vector parsing
  body = `${JSON.stringify(body)
    .replaceAll('\\"', '"')
    .replaceAll('"{"', '{"')
    .replaceAll('"}"', '"}')}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(username &&
        apiToken && {
          Authorization:
            "Basic " +
            Buffer.from(username + ":" + apiToken).toString("base64"),
        }),
      // Custom HEADERS
      ...(headers ?? {}),
    },
    body,
  });
}
