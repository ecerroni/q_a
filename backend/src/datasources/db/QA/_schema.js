import mongoose from "mongoose";
import { uniquenessValidator } from "../_utils";

const schema = mongoose.Schema(
  {
    question: {
      type: String,
      ...uniquenessValidator({ required: true }),
    },
    answer: String,
    user: mongoose.SchemaTypes.ObjectId,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default schema;
