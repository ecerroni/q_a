import { GraphQLScalarType, Kind } from "graphql";
import { ValidationError } from "apollo-server-errors";

function safeUrl(url) {
  let value = url;
  if (!/^(?:f|ht)tps?:\/\//.test(url)) {
    value = `http://${url}`;
  }
  return value?.replace("http://", "https://");
}
function validate(value) {
  const url = safeUrl(value);
  if (new URL(url.toString()).toString()) return value;
  throw new ValidationError(
    "Value must be a non-empty domain or domain url string",
  );
}

const GraphQLWebsite = new GraphQLScalarType({
  name: "Website",
  description:
    "The «Website» scalar type represents a non-empty domain or domain url string",
  parseValue: value => validate(value).toLowerCase(),
  serialize: validate,
  parseLiteral: ast => {
    switch (ast.kind) {
      case Kind.STRING:
        return validate(ast.value);
      default:
        break;
    }
    return null;
  },
});

export default GraphQLWebsite;
