import { tester } from "graphql-tester-options";
import to from "await-to-js";
import t from "tap";
import { SERVER } from "../../src/config";
import ROLES_PERMISSIONS from "../../src/config/_roles-permissions";

const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

const UserAndRoleQuery = `
  query userAndRole {
    users {
      name
      role
    }
  }
`;

// USERS
let test;
t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});
t.test("should retrieve users with roles", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: UserAndRoleQuery,
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  const {
    data: { users: resUsers },
  } = res;
  const users = resUsers.reduce(
    (obj, user) => ({
      ...obj,
      [user.name]: {
        ...user,
      },
    }),
    {},
  );
  // console.log(ROLES_PERMISSIONS, "RESPONSE USERS:", resUsers);
  t.equal(users.Enrico.role, ROLES_PERMISSIONS.ADMIN.SPEC.VALUE);
  t.equal(users.George.role, ROLES_PERMISSIONS.USER.SPEC.VALUE);
  const allPermissions = Object.entries(ROLES_PERMISSIONS)
    .filter(([role]) => role !== "OWNER")
    .reduce(
      (arr, [key, value]) => [
        ...arr,
        ...Object.entries(value.PERMISSIONS).reduce(
          (a, [k, v]) => [...a, ...v.map(i => `${k}_${i}`)],
          [],
        ),
      ],
      [],
    );

  t.equal(err, null);
  t.end();
});
