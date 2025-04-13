import SCOPES from "~/config/_scopes";
import { permissions } from "../../../directives";

const { ROLES = {} } = SCOPES || {};
const roles = Object.keys(ROLES);

export const types = `
  enum enumRoles {
    ${roles.join(" ")}
  }
  """
    <strong>The User Object</strong>. \n
    Basic user data. This is the compact version of the object.
  """
  type User {
    _id: ID!
    name: String
    "unique"
    username: String
    "unique"
    email: String @${permissions.can.read.user_profile}
    role: enumRoles
    # bestFriend: User
    # peer: User
    hasAccess: Boolean
  }`;

export const typeResolvers = {
  User: {},
};
