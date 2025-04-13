import mongoose from "mongoose";
import t from "tap";
import { mockObjectId as mockID } from "../src/utils/_mongo-mock-id";

// uniqueObjectIdArray accepts an array of mixed types (either a string or a mongoose object) and returns an array of strings ids that are unique
// items are ordered first

const ObjectId = mongoose.Types.ObjectId;

t.test("mockID returns an actual mongo ObjectId", async t => {
  const test = mockID("one");
  t.same(test, ObjectId(test.toString()));
  t.end();
});
t.test("force mockID to return plain string", async t => {
  const test = mockID("one", { plainText: true });
  t.equal(typeof test, "string");
  t.end();
});
t.test("create a seeded mocked mongo _id", async t => {
  const test = [mockID("one"), mockID("one")];
  t.same(test[0], test[1]);
  t.end();
});
t.test("different seeds create different _id", async t => {
  const test = [mockID("one"), mockID("two")];
  t.notSame(test[0], test[1]);
  t.end();
});
