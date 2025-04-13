import APP from "$/settings/app.json";
import { isTesting } from "~/environment";

export default {
  ...APP,
  ENDPOINT: {
    ...APP.ENDPOINT,
    PORT: isTesting ? 3000 : APP.ENDPOINT.PORT,
  },
};
