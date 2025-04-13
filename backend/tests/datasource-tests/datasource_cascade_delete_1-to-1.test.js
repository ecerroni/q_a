import { tester } from "graphql-tester-options";
import decode from "jwt-decode";
import to from "await-to-js";
import t from "tap";
import { SERVER } from "../../src/config";
import ROLES_PERMISSIONS from "../../../settings/roles-permissions.json";
import { deepFlatten } from "../../src/utils";
import { deletionChecks } from "./_utils";

const { PORT, GRAPHQL, PROTOCOL, HOST } = SERVER;

const loginQuery = `
mutation login ($userCredentials: userCredentials!) {
  login(input: $userCredentials)
}`;

const testCascadeDeleteResourcesSingleMutation = `
  mutation testCascadeDeleteResourcesSingle($input: MJSON!) {
    testCascadeDeleteResourcesSingle(input: $input)
  }
`;

const testGetDataQuery = `
  query testGetData {
    testGetData
  }
`;

let sharedToken;
let sharedRefreshToken;
let currentUserId;
let users;
let companies;

let test;
t.beforeEach(t => {
  // Set up JWT token
  test = tester({
    url: `${PROTOCOL}://${HOST}:3000${GRAPHQL}`,
    contentType: "application/json",
  });
});

let initialData = {};
// afterAll(async () => {
//   await new Promise(resolve => setTimeout(resolve, 100)); // --forceExit swallow console.log | Ref: https://stackoverflow.com/a/41094010/5546463
// });
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
t.test("should be allowed to retrieve all users", async t => {
  const [err, res] = await to(
    test(
      JSON.stringify({
        query: testGetDataQuery,
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
  t.equal(!!res.data.testGetData, true);
  initialData = res.data.testGetData;
  users = initialData.users;
  companies = users.map(user => user.company).filter(v => !!v);

  t.equal(err, null);
  t.end();
});

// ONE TO ONE STRONG/STRONG DELETE TEST | HUSBAND (STRONG) => WIFE (STRONG)

t.test(
  "should be allowed to delete wife doc when husband is deleted",
  async t => {
    const tie = "strong";
    currentUserId = initialData.husbands[tie].find(user => user.name === "joe")
      ._id;
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testCascadeDeleteResourcesSingleMutation,
          variables: {
            input: { entity: `Husband_${tie}`, id: currentUserId },
          },
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
    // console.log(users.filter(user => user.username === 'meg')[0]);
    // console.log(JSON.stringify(res.data.testCascadeDeleteResourcesSingle, null, 2));
    t.equal(res.status, 200);
    t.equal(res.success, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    t.equal(res.data.testCascadeDeleteResourcesSingle.length > 0, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    const {
      data: { testCascadeDeleteResourcesSingle: data },
    } = res;
    data.forEach(function(item) {
      t.equal(item.ids.length > 0, true);
      //  console.log('JOE [HUSBAND]', currentUserId);
      //  console.log('[WIFE]', initialData.wifes.strong.find(person => person.husband === currentUserId)._id);
      //  console.log(JSON.stringify(item, null, 2));
      const deletedItems = Object.values(item.items).reduce((arr, array) => {
        return [
          ...arr,
          {
            deletedItem: array.reduce((o, i) => ({ ...o, ...i }), {}),
          },
        ];
      }, []);
      deletedItems.forEach(function(object) {
        const { deletedItem = {} } = object || {};
        if (Object.keys(deletedItem).length > 0)
          t.equal(
            deletionChecks({
              deletedItem,
              collection: item.collection,
              entityIdFields: item.entityIdFields,
              deletion: item.deletion,
            }),
            true,
          );
      });
    });

    t.equal(err, null);
    t.end();
  },
);

// ONE TO ONE STRONG/WEAK DELETE TEST | HUSBAND (STRONG) => WIFE (WEAK)

t.test(
  "should be allowed $unset husband field on wife doc when husband is deleted",
  async t => {
    const tie = "weak";
    currentUserId = initialData.husbands[tie].find(user => user.name === "mike")
      ._id;
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testCascadeDeleteResourcesSingleMutation,
          variables: {
            input: {
              entity: `Husband_${tie}`,
              id: currentUserId,
              deletion: "strong",
            },
          },
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
    // console.log(users.filter(user => user.username === 'meg')[0]);
    // console.log(JSON.stringify(res.data.testCascadeDeleteResourcesSingle, null, 2));
    t.equal(res.status, 200);
    t.equal(res.success, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    t.equal(res.data.testCascadeDeleteResourcesSingle.length > 0, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    const {
      data: { testCascadeDeleteResourcesSingle: data },
    } = res;
    data.forEach(function(item) {
      t.equal(item.ids.length > 0, true);
      //  console.log('JOE [HUSBAND]', currentUserId);
      //  console.log('[WIFE]', initialData.wifes[tie].find(person => person.husband === currentUserId)._id);
      const deletedItems = Object.values(item.items).reduce((arr, array) => {
        return [
          ...arr,
          {
            deletedItem: array.reduce((o, i) => ({ ...o, ...i }), {}),
          },
        ];
      }, []);
      deletedItems.forEach(function(object) {
        const { deletedItem = {} } = object || {};
        if (Object.keys(deletedItem).length > 0)
          t.equal(
            deletionChecks({
              deletedItem,
              collection: item.collection,
              entityIdFields: item.entityIdFields,
              deletion: item.deletion,
            }),
            true,
          );
      });
    });

    t.equal(err, null);
    t.end();
  },
);

// ONE TO ONE STRONG/SOFT DELETE TEST | HUSBAND (STRONG) => WIFE (SOFT)

t.test(
  "should be allowed to soft delete wife doc when husband is deleted",
  async t => {
    const tie = "soft";
    currentUserId = initialData.husbands[tie].find(
      user => user.name === "mitch",
    )._id;
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testCascadeDeleteResourcesSingleMutation,
          variables: {
            input: {
              entity: `Husband_${tie}`,
              id: currentUserId,
              deletion: "strong",
            },
          },
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
    // console.log(users.filter(user => user.username === 'meg')[0]);
    // console.log(JSON.stringify(res.data.testCascadeDeleteResourcesSingle, null, 2));
    t.equal(res.status, 200);
    t.equal(res.success, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    t.equal(res.data.testCascadeDeleteResourcesSingle.length > 0, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    const {
      data: { testCascadeDeleteResourcesSingle: data },
    } = res;
    data.forEach(function(item) {
      // console.log('MITCH [HUSBAND]', currentUserId);
      // console.log(initialData.wifes[tie]);
      // console.log('[WIFE]', initialData.wifes[tie].find(person => person.husband === currentUserId)._id);
      // console.log('STRONG/SOFT', JSON.stringify(item, null, 2));
      t.equal(item.ids.length > 0, true);
      const deletedItems = Object.values(item.items).reduce((arr, array) => {
        return [
          ...arr,
          {
            deletedItem: array.reduce((o, i) => ({ ...o, ...i }), {}),
          },
        ];
      }, []);
      deletedItems.forEach(function(object) {
        const { deletedItem = {} } = object || {};
        if (Object.keys(deletedItem).length > 0)
          t.equal(
            deletionChecks({
              deletedItem,
              collection: item.collection,
              entityIdFields: item.entityIdFields,
              deletion: item.deletion,
            }),
            true,
          );
      });
    });

    // wait(100000)
    t.equal(err, null);
    t.end();
  },
);

// ONE TO ONE SOFT/SOFT DELETE TEST | HUSBAND (SOFT) => WIFE (SOFT)

t.test(
  "should be allowed to soft delete wife doc when husband is soft deleted",
  async t => {
    const tie = "soft";
    currentUserId = initialData.husbands[tie].find(user => user.name === "mike")
      ._id;
    const [err, res] = await to(
      test(
        JSON.stringify({
          query: testCascadeDeleteResourcesSingleMutation,
          variables: {
            input: {
              entity: `Husband_${tie}`,
              id: currentUserId,
              deletion: "soft",
            },
          },
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
    // console.log(users.filter(user => user.username === 'meg')[0]);
    // console.log(JSON.stringify(res.data.testCascadeDeleteResourcesSingle, null, 2));
    t.equal(res.status, 200);
    t.equal(res.success, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    t.equal(res.data.testCascadeDeleteResourcesSingle.length > 0, true);
    t.equal(!!res.data.testCascadeDeleteResourcesSingle, true);
    const {
      data: { testCascadeDeleteResourcesSingle: data },
    } = res;
    data.forEach(function(item) {
      t.equal(item.ids.length > 0, true);
      //  console.log('JOE [HUSBAND]', currentUserId);
      //  console.log('[WIFE]', initialData.wifes[tie].find(person => person.husband === currentUserId)._id);
      // console.log(JSON.stringify(item, null, 2));
      const deletedItems = Object.values(item.items).reduce((arr, array) => {
        return [
          ...arr,
          {
            deletedItem: array.reduce((o, i) => ({ ...o, ...i }), {}),
          },
        ];
      }, []);
      deletedItems.forEach(function(object) {
        const { deletedItem = {} } = object || {};
        if (Object.keys(deletedItem).length > 0)
          t.equal(
            deletionChecks({
              deletedItem,
              collection: item.collection,
              entityIdFields: item.entityIdFields,
              deletion: item.deletion,
            }),
            true,
          );
      });
    });

    // wait(100000)
    t.equal(err, null);
    t.end();
  },
);
