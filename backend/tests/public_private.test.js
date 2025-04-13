import { tester } from "graphql-tester-options";
import to from "await-to-js";
import t from "tap";
import decode from "jwt-decode";
import { SERVER } from "../src/config";
import { UNAUTHORIZED } from "../src/environment";
import ROLES_PERMISSIONS from "../../settings/roles-permissions.json";
import { deepFlatten } from "../src/utils";

let test;
const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

const loginQuery = `
mutation login ($userCredentials: userCredentials!) {
  login(input: $userCredentials)
}`;
const publicPingQuery = `
  query ping {
    ping
  }
`;

const privateAuthQuery = `
  query _testCheckAuthAdmin {
    _testCheckAuthAdmin
  }
`;

let sharedToken;
let sharedRefreshToken;
let currentUserId;

// USERS
t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});

t.test("should be allowed to call public queries", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: publicPingQuery,
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  const { data: { ping = "" } = {} } = res;
  t.equal(ping, "Server is up and running... working smoothly");

  t.equal(err, null);
  t.end();
});
t.test("should be NOT allowed to call private queries", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: privateAuthQuery,
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 401);
  t.equal(res.success, false);
  const { errors } = res;
  t.equal(Array.isArray(errors), true);
  t.equal(res.errors[0].message, UNAUTHORIZED);
  t.equal(err, null);
  t.end();
});
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
  const decodedToken = decode(token);
  const { user: { roles, permissions, id } = {} } = decodedToken;
  currentUserId = id;
  t.equal(Array.isArray(permissions), true);
  t.equal(Array.isArray(roles), true);
  t.equal(
    roles.length,
    deepFlatten(ROLES_PERMISSIONS.USERS).reduce((count, user) => {
      if (Array.isArray(user)) return count + user.length;
      return count + 1;
    }, 0),
  );
  const rightRoles = roles.includes("ADMIN") && roles.includes("USER");
  t.equal(rightRoles, true);

  t.equal(err, null);
  t.end();
});
t.test("should be allowed to call private queries", async t => {
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
          "x-connector-token": sharedToken,
          "x-connector-refresh-token": sharedRefreshToken,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(
    res.data._testCheckAuthAdmin,
    `Authorized | CurentUserId ${currentUserId}!`,
  );

  t.equal(err, null);
  t.end();
});
