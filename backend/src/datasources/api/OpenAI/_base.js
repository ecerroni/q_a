import got from "got";
import { storageAdapter } from "~/config";
import { isDevelopment } from "~/environment";
import { log } from "~/utils";

export default class {
  constructor() {
    this.request = got.extend({
      prefixUrl: process.env.API_OPEN_AI_ENDPOINT,
      cache: storageAdapter.api,
      headers: {
        // custom headers
      },
      hooks: {
        beforeRequest: [
          options => {
            // dynamic headers
            if (options.context?.token)
              // eslint-disable-next-line no-param-reassign
              options.headers.token = options.context.token;
          },
        ],
        afterResponse: [
          response => {
            if (isDevelopment) {
              const { isFromCache, statusCode, url } = response;
              log.dev(
                "[API][CACHE]",
                url,
                statusCode,
                isFromCache ? "[HIT]" : "[MISS]",
              );
            }
            console.log({ response });
            // No changes otherwise
            return response;
          },
        ],
      },
    });
  }
}
