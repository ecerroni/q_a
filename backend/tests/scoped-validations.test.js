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

const queries = {
  noDuplicateNamesOnCreation: `
   mutation testAddDuplicatesOnCreation($names: [String!]!) {
     testAddDuplicatesOnCreation(names: $names)
   }
`,
  noDuplicateNamesOnScopedCreation: `
   mutation testAddDuplicatesOnScopedCreation($name: String!) {
     testAddDuplicatesOnScopedCreation(name: $name)
   }
`,
  noDuplicateNamesOnUpdate: `
   mutation testAddDuplicatesOnUpdate($name: String!) {
     testAddDuplicatesOnUpdate(name: $name)
   }
`,
  noDuplicateNamesOnScopedUpdate: `
 mutation testAddDuplicatesOnScopedUpdate($name: String!) {
   testAddDuplicatesOnScopedUpdate(name: $name)
 }
`,
};

t.test("should not allow duplicate names on creation", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: queries.noDuplicateNamesOnCreation,
        variables: {
          names: ["test", "test"],
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, false);
  t.equal(res.errors[0].message.includes("ValidationError: name: test"), true);

  t.equal(err, null);
  t.end();
}),
  t.test("should not allow duplicate names on update", async t => {
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: queries.noDuplicateNamesOnUpdate,
          variables: {
            name: "test",
          },
        }),
        { jar: true },
      ),
    );
    t.equal(res.status, 200);
    t.equal(res.success, false);
    t.equal(
      res.errors[0].message.includes("ValidationError: name: test"),
      true,
    );

    t.equal(err, null);
    t.end();
  });
t.test("should not allow duplicate names on scoped creation", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: queries.noDuplicateNamesOnScopedCreation,
        variables: {
          name: "test",
        },
      }),
      { jar: true },
    ),
  );
  console.log(res);
  t.equal(res.status, 200);
  t.equal(res.success, false);
  t.equal(res.errors[0].message.includes("ValidationError: name: test"), true);

  t.equal(err, null);
  t.end();
});
t.test("should not allow duplicate names on scoped update", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: queries.noDuplicateNamesOnScopedUpdate,
        variables: {
          name: "test",
        },
      }),
      { jar: true },
    ),
  );
  t.equal(res.status, 200);
  t.equal(res.success, false);
  t.equal(res.errors[0].message.includes("ValidationError: name: test"), true);

  t.equal(err, null);
  t.end();
});
// TODO: [rico] add tests for allowing duplicates with different scoped validations
