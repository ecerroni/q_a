import mongoose from "mongoose";
import RandomGenerator from "random-seed-generator";

const mocks = {
  id: (modifier = Math.random()) => {
    let random = Buffer.from("Mock" + modifier).toString("base64");
    return random;
  },
  _id: (modifier = Math.random()) => {
    let mock = RandomGenerator.createWithSeeds("Mock" + modifier).hexString(24);
    return mock;
  },
};

export const mockID = str => {
  return mocks.id(str);
};

export const mockObjectId = (str, options) => {
  const { plainText = false } = options || {};
  const id = mongoose.Types.ObjectId(mocks._id(str));
  return plainText ? id.toString() : id;
};
