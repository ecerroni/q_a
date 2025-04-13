import mongoose from "mongoose";
import { uniquenessValidator } from "../../../../src/datasources/db/_utils";

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      ...uniquenessValidator({ required: true, scope: "owner" }),
    },
    owner: mongoose.ObjectId,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default schema;
