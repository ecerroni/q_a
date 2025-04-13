import { tester } from "graphql-tester-options";
import decode from "jwt-decode";
import to from "await-to-js";
import t from "tap";
import { SERVER } from "../src/config";
// import { to, asyncArray } from '../src/utils';
import ROLES_PERMISSIONS from "../../settings/roles-permissions.json";
import { deepFlatten } from "../src/utils";

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

const privateAuthQuery = `
  query _checkAuth {
    _checkAuth
  }
`;
// USERS

t.test(
  "should login with HTTP_ONLY strategy, right credentials and full rights",
  async t => {
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
        {
          jar: true,
          headers: {
            "Content-Type": "application/json",
            "x-connector-auth-request-type": "HTTP_ONLY",
          },
        },
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
    t.equal(res.headers["set-cookie"].length > 0, true);
    t.equal(
      res.headers["set-cookie"].toString().includes("x-connector-token="),
      true,
    );
    t.equal(
      res.headers["set-cookie"]
        .toString()
        .includes(",x-connector-refresh-token="),
      true,
    );

    t.equal(err, null);
    t.end();
  },
);
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
          "x-connector-auth-request-type": "HTTP_ONLY",
        },
      },
    ),
  );

  t.equal(res.status, 200);
  t.equal(res.success, true);

  t.equal(err, null);
  t.end();
});
