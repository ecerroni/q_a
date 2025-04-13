import mongoose from "mongoose";
import to from "await-to-js";
import t from "tap";
import { uniqueObjectIdArray } from "../src/utils/_array";

// uniqueObjectIdArray accepts an array of mixed types (either a string or a mongoose object) and returns an array of strings ids that are unique
// items are ordered first

const ObjectId = id => new mongoose.Types.ObjectId(id);

t.test(
  'should return [ObjectId("614494be59ef17e9843dd055")] when same objects only',
  t => {
    const test = [
      ObjectId("614494be59ef17e9843dd055"),
      ObjectId("614494be59ef17e9843dd055"),
    ];
    const match = [ObjectId("614494be59ef17e9843dd055")];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
t.test(
  'should return ["614494be59ef17e9843dd055"] when same objects and strings',
  t => {
    const test = [
      "614494be59ef17e9843dd055",
      ObjectId("614494be59ef17e9843dd055"),
    ];
    const match = ["614494be59ef17e9843dd055"];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
t.test(
  'should return ["614494be59ef17e9843dd055"] when same strings only',
  t => {
    const test = ["614494be59ef17e9843dd055", "614494be59ef17e9843dd055"];
    const match = ["614494be59ef17e9843dd055"];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
t.test(
  'should return ["6142fe8b0368a250b7c75100", "6142fe8b0368a250b7c75102"] when different strings only',
  t => {
    const test = ["6142fe8b0368a250b7c75102", "6142fe8b0368a250b7c75100"];
    const match = ["6142fe8b0368a250b7c75100", "6142fe8b0368a250b7c75102"];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
t.test(
  'should return ["6142fe8b0368a250b7c75100", "6142fe8b0368a250b7c75102"] when different objects only',
  t => {
    const test = [
      ObjectId("6142fe8b0368a250b7c75102"),
      ObjectId("6142fe8b0368a250b7c75100"),
    ];
    const match = [
      ObjectId("6142fe8b0368a250b7c75100"),
      ObjectId("6142fe8b0368a250b7c75102"),
    ];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
t.test(
  "should return ordered unique ids when mixed strings and objects, some being the same",
  t => {
    const test = [
      ObjectId("6142fe8b0368a250b7c75102"),
      ObjectId("6142fe8b0368a250b7c75100"),
      ObjectId("6142fe8b0368a250b7c75101"),
      ObjectId("6142fe8b0368a250b7c75102"),
      "6142fe8b0368a250b7c75102",
      "6142fe8b0368a250b7c75103",
    ];
    const match = [
      ObjectId("6142fe8b0368a250b7c75100"),
      ObjectId("6142fe8b0368a250b7c75101"),
      ObjectId("6142fe8b0368a250b7c75102"),
      "6142fe8b0368a250b7c75103",
    ];
    const result = uniqueObjectIdArray(test);
    t.strictSame(result, match);
    t.end();
  },
);
