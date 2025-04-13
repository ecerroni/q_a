import { tester } from "graphql-tester-options";
import to from "await-to-js";
import t from "tap";
import { SERVER } from "../src/config";

let test;
const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});
const testTypesQuery = {
  JSON: `
    query testJSON {
      testJSON(where: { json: true })
    }
  `,
  SafeMJSON: `
    query testSafeMJSON {
      testSafeMJSON(where: { json: true })
    }
  `,
  UnsafeMJSON: `
    query testUnsafeMJSON ($where: MJSON!){
      testUnsafeMJSON(where: $where)
    }
  `,
};

// USERS

t.test("should be valid JSON", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testTypesQuery.JSON,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": null,
          "x-connector-refresh-token": null,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testJSON, true);

  t.equal(err, null);
  t.end();
});
t.test("should be valid MJSON", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testTypesQuery.SafeMJSON,
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": null,
          "x-connector-refresh-token": null,
        },
      },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  t.equal(res.data.testSafeMJSON, true);

  t.equal(err, null);
  t.end();
});
t.test("should be not valid MJSON", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testTypesQuery.UnsafeMJSON,
        variables: {
          where: { json: { $in: [true] } },
        },
      }),
      {
        jar: true,
        headers: {
          "Content-Type": "application/json",
          "x-connector-auth-request-type": "LOCAL_STORAGE",
          "x-connector-token": null,
          "x-connector-refresh-token": null,
        },
      },
    ),
  );
  t.equal(res.status, 400);
  t.equal(res.success, false);
  t.equal(
    res.errors[0].message.includes(
      "[MJSON]: This JSON contains unsafe NoSQL for mongodb",
    ),
    true,
  );

  t.equal(err, null);
  t.end();
});
