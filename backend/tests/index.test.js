import decode from "jwt-decode";
import t from "tap";
import to from "await-to-js";
import { tester } from "graphql-tester-options";
import { SERVER } from "../src/config/index.js";
// import { to, asyncArray } from '../src/utils';
import { ERROR } from "../src/environment/index.js";
import { deepFlatten } from "../src/utils/index.js";
import ROLES_PERMISSIONS from "../../settings/roles-permissions.json";

let test;
const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

const loginQuery = `
mutation login ($userCredentials: userCredentials!) {
  login(input: $userCredentials)
}`;

t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});

// USERS
t.test("should not login with wrong credentials", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "test",
            password: "MTExMTEx",
          },
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, false);
  t.equal(res.errors[0].message, ERROR.USER.WRONG_CREDENTIALS);
  t.equal(err, null);
  t.end();
});
t.test("should not login with wrong password", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "rico",
            password: "MTExMTEx",
          },
        },
      }),
      { jar: true },
    ),
  );

  t.equal(res.status, 200);
  t.equal(res.success, false);
  t.equal(res.errors[0].message, ERROR.USER.WRONG_PASSWORD);

  t.equal(err, null);
  t.end();
});
t.test("should not login with non encoded (base64) password", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "rico",
            password: "123456", // right password but not encoded (base64)
          },
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 400);
  t.equal(res.success, false);
  t.equal(
    res.errors[0].message.includes(
      "Value must be a non-empty Base64-encoded string",
    ),
    true,
  );

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
  const { token } = JSON.parse(login);
  const decodedToken = decode(token);
  const { user: { roles, permissions } = {} } = decodedToken;
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
t.test("should login with right credentials and limited rights", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: loginQuery,
        variables: {
          userCredentials: {
            username: "george",
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
  const { token } = JSON.parse(login);
  const decodedToken = decode(token);
  const { user: { roles, permissions } = {} } = decodedToken;
  t.equal(Array.isArray(permissions), true);
  t.equal(Array.isArray(roles), true);
  t.equal(roles.length, 1);
  const rightRoles = roles.includes("USER");
  t.equal(rightRoles, true);
  t.equal(err, null);
  t.end();
});
