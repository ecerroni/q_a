import { tester } from "graphql-tester-options";
import to from "await-to-js";
import t from "tap";
import decode from "jwt-decode";
import { SERVER } from "../src/config";
import { FORBIDDEN, NOT_ALLOWED } from "../src/environment";
import { mockUsers } from "../src/mocks/_users";
import { mockUsers as testMockUsers } from "./fixtures";
import ROLES_PERMISSIONS from "../src/config/_roles-permissions";
const testUsersUsernames = testMockUsers.map(tu => tu.username);

let test;
const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});

const loginQuery = `
mutation login ($userCredentials: userCredentials!) {
  login(input: $userCredentials)
}`;

const testPermissionsQuery = {
  hasRole: `
    query testPermissions {
      testPermissionsHasRole
    }
  `,
  isAllowed: `
    query testPermissions {
      testPermissionsIsAllowed
    }
  `,
  isAllowedField: `
    query users {
      users {
        email
        username
      }
    }
  `,
};

const privateAuthQuery = `
  query _testCheckAuthAdmin {
    _testCheckAuthAdmin
  }
`;

let sharedToken;
let sharedRefreshToken;
let sharedRestrictedToken;
let sharedRestrictedRefreshToken;
// USERS

t.test("should login with right credentials and full rights", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "rico",
            password: "MTIzNDU2", // 'this 123456' encoded (base64). It'll be '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' hashed
          },
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  const { data: { login = null } = {} } = res;
  t.equal(typeof login, "string");
  const tokens = login.includes("token") && login.includes("refreshToken");
  t.equal(tokens, true);
  const { token, refreshToken } = JSON.parse(login);
  sharedToken = token;
  sharedRefreshToken = refreshToken;

  t.equal(err, null);
  t.end();
});
t.test("should login with right credentials and limited rights", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "mike", // mike is STAFF and cannot read USER's stuff
            password: "MTIzNDU2", // 'this 123456' encoded (base64). It'll be '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92' hashed
          },
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  const { data: { login = null } = {} } = res;
  t.equal(typeof login, "string");
  const tokens = login.includes("token") && login.includes("refreshToken");
  t.equal(tokens, true);
  const { token, refreshToken } = JSON.parse(login);
  sharedRestrictedToken = token;
  sharedRestrictedRefreshToken = refreshToken;

  t.equal(err, null);
  t.end();
});
t.test("should have permissions with hasRole", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.hasRole,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testPermissionsHasRole, "ok role");

  t.equal(err, null);
  t.end();
});
t.test("should NOT have permissions with hasRole", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.hasRole,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedRestrictedToken,
          "x-connector-refresh-token": sharedRestrictedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 403);
  t.equal(res.success, false);
  const { errors } = res;
  t.equal(Array.isArray(errors), true);
  t.equal(res.errors[0].message, FORBIDDEN);

  t.equal(err, null);
  t.end();
});
t.test("should have permissions with isAllowed", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.isAllowed,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testPermissionsIsAllowed, "ok permission");

  console.log(err);
  t.equal(err, null);
  t.end();
});
t.test("should NOT have permissions with isAllowed", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.isAllowed,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedRestrictedToken,
          "x-connector-refresh-token": sharedRestrictedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, false);
  const { errors } = res;
  t.equal(Array.isArray(errors), true);
  t.equal(res.errors[0].message, NOT_ALLOWED);

  t.equal(err, null);
  t.end();
});
t.test("should have permissions with isAllowed on Field", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.isAllowedField,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(
    res.data.users.filter(
      u => !!u.email && !testUsersUsernames.includes(u.username),
    ).length,
    mockUsers.length,
  );

  t.equal(err, null);
  t.end();
});
t.test(
  "should NOT have permissions with isAllowed on Field [Return null for the field and response status 200]",
  async t => {
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testPermissionsQuery.isAllowedField,
        }),
        {
          jar: true,
          headers: {
            "Content-Type": "application/json",
            "x-connector-auth-request-type": "LOCAL_STORAGE",
            "x-connector-token": sharedRestrictedToken,
            "x-connector-refresh-token": sharedRestrictedRefreshToken,
          },
        },
      ),
    );
    t.equal(res.status, 200);
    t.equal(res.success, true);
    t.equal(
      res.data.users.filter(u => !testUsersUsernames.includes(u.username))
        .length,
      mockUsers.length,
    );
    t.equal(res.data.users.filter(u => !!u.email).length, 0);

    t.equal(err, null);
    t.end();
  },
);
t.test(
  "should NOT have permissions with isAllowed if not logged in at all",
  async t => {
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testPermissionsQuery.isAllowed,
        }),
        {
          jar: true,
        },
      ),
    );
    t.equal(res.status, 200);
    t.equal(res.success, false);
    const { errors } = res;
    t.equal(Array.isArray(errors), true);
    t.equal(res.errors[0].message, NOT_ALLOWED);

    t.equal(err, null);
    t.end();
  },
);
t.test(
  "should NOT be allowed to call private queries [Return FORBIDDEN]",
  async t => {
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: privateAuthQuery,
        }),
        {
          jar: true,
          headers: {
            "Content-Type": "application/json",
            "x-connector-auth-request-type": "LOCAL_STORAGE",
            "x-connector-token": sharedRestrictedToken,
            "x-connector-refresh-token": sharedRestrictedRefreshToken,
          },
        },
      ),
    );
    t.equal(res.status, 403);
    t.equal(res.success, false);
    const { errors } = res;
    t.equal(Array.isArray(errors), true);
    t.equal(res.errors[0].message, FORBIDDEN);

    t.equal(err, null);
    t.end();
  },
);

t.test("should inherit lower rank roles", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.hasRole,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testPermissionsHasRole, "ok role");
  const {
    user: { roles },
  } = decode(sharedToken);
  const allRoles = Object.keys(ROLES_PERMISSIONS).filter(
    role => role !== "OWNER",
  );
  t.equal(roles.length, allRoles.length);

  t.equal(err, null);
  t.end();
});
t.test("should inherit lower rank permissions", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testPermissionsQuery.hasRole,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testPermissionsHasRole, "ok role");
  const {
    user: { permissions },
  } = decode(sharedToken);

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

  t.equal(permissions.length, Array.from(new Set(allPermissions)).length);

  t.equal(err, null);
  t.end();
});
