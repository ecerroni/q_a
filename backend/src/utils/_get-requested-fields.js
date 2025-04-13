import graphqlFields from "graphql-fields";
import { log } from "./logger";

const transformFields = ({ fields: o, flatten = [], nesting = false }) =>
  Object.entries(o).reduce(
    (str, [key, value]) =>
      `${str}${
        value &&
        typeof value === "object" &&
        !flatten.includes(key) &&
        nesting &&
        Object.keys(value).length > 0
          ? Object.entries(value).reduce(
              (s, [k, v]) =>
                `${s}${`${key}.${transformFields({
                  fields: { [k]: v },
                  flatten,
                  nesting,
                })} `}`,
              "",
            )
          : `${key} `
      }`,
    "",
  );

export default (info, flatten = []) => {
  const fields = graphqlFields(info);

  const select = transformFields({ fields, flatten, nesting: false });
  log.dev({ select });
  return select;
};
