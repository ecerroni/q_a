import apiSource from "./api";
import { dbSource } from "./db";

export { UserHelper } from "./db";

export default async db => ({
  ...apiSource,
  ...(await dbSource(db)),
});
