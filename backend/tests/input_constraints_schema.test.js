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

const testConstraintsQuery = {
  minStringLengthIs3: `
    query testConstraint {
      testConstraint(input: { minStringLengthIs3: "aaa" })
    }
  `,
  wrongMinStringLengthIs3: `
    query testConstraint {
      testConstraint(input: { minStringLengthIs3: "bb" })
    }
  `,
};

const testYupsQuery = {
  testInputValidationOnMutationNoArgs: `
    mutation testInputValidationOnMutation {
      testInputValidationOnMutation
    }
  `,
  testInputValidationOnMutationErrorYup: `
    mutation testInputValidationOnMutation {
      testInputValidationOnMutation(yup: 1)
    }
  `,
  testInputValidationOnMutationErrorText: `
    mutation testInputValidationOnMutation {
      testInputValidationOnMutation(yup: 3, text: "123")
    }
  `,
  testInputValidationOnMutationOk: `
    mutation testInputValidationOnMutation {
      testInputValidationOnMutation(yup: 3, text: "1234")
    }
  `,
};

// USERS

t.test("should be valid input", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testConstraintsQuery.minStringLengthIs3,
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
  t.equal(!!res.data.testConstraint, true);

  t.equal(err, null);
  t.end();
});

t.test("should be NOT valid input", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testConstraintsQuery.wrongMinStringLengthIs3,
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

  console.log({ res });
  t.equal(res.status, 422);
  t.equal(res.success, false);
  const { errors } = res;
  t.equal(Array.isArray(errors), true);
  t.equal(
    !!res.errors.find(
      error => error.extensions.code === "MER_VALIDATION_ERR_FAILED_VALIDATION",
    ),
    true,
  );
  t.equal(err, null);
  t.end();
});

// YUP
t.test("should be valid input yup", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testYupsQuery.testInputValidationOnMutationNoArgs,
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
  t.equal(!!res.data.testInputValidationOnMutation, true);
  t.equal(res.data.testInputValidationOnMutation.yup, 3);

  t.equal(err, null);
  t.end();
});

t.test("should be valid input yup + text", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testYupsQuery.testInputValidationOnMutationOk,
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
  t.equal(!!res.data.testInputValidationOnMutation, true);
  t.equal(res.data.testInputValidationOnMutation.yup, 3);
  t.equal(res.data.testInputValidationOnMutation.text, "1234");

  t.equal(err, null);
  t.end();
});

t.test("should NOT be valid input yup", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testYupsQuery.testInputValidationOnMutationErrorYup,
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
  t.equal(res.status, 422);
  t.equal(res.success, false);
  t.equal(!!res.data.testInputValidationOnMutation, false);
  t.equal(
    !!res.errors.find(
      error => error.extensions.code === "ERR_GRAPHQL_YUP_VALIDATION",
    ),
    true,
  );

  t.equal(err, null);
  t.end();
});
t.test("should NOT be valid input yup", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testYupsQuery.testInputValidationOnMutationErrorText,
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
  t.equal(res.status, 422);
  t.equal(res.success, false);
  t.equal(!!res.data.testInputValidationOnMutation, false);
  t.equal(
    !!res.errors.find(
      error => error.extensions.code === "ERR_GRAPHQL_YUP_VALIDATION",
    ),
    true,
  );

  t.equal(err, null);
  t.end();
});
