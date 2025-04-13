import mongoose from "mongoose";
import { uniquenessValidator } from "../../../../src/datasources/db/_utils";

import enums from "./_enums"; // eslint-disable-line no-unused-vars

const schema = mongoose.Schema(
  {
    owner: mongoose.ObjectId,
    name: {
      type: String,
      ...uniquenessValidator({ required: true }),
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

export default schema;
