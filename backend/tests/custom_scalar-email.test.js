import { tester } from "graphql-tester-options";
import to from "await-to-js";
import t from "tap";
import { SERVER } from "../src/config";

let test;
const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

const emailTestQuery = `
  query testEmailScalar {
    testEmailScalar
  }
`;

t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});

// USERS
t.test("should return an email", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: emailTestQuery,
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, true);
  const { data: { testEmailScalar = "" } = {} } = res;
  t.equal(testEmailScalar, "info@test.com");

  t.equal(err, null);
  t.end();
});
