import mongoose from "mongoose";
import SCOPES from "~/config/_scopes";
import { uniquenessValidator } from "../../db/_utils";

const { ROLES = {} } = SCOPES || {};
const roles = Object.keys(ROLES);

const schema = mongoose.Schema(
  {
    username: {
      type: String,
      ...uniquenessValidator({ required: true }),
    },
    email: {
      type: String,
      ...uniquenessValidator({ required: true }),
    },
    password: {
      type: String,
      required: true,
    },
    delta: {
      type: Number,
      default: 0,
    },
    name: String,
    firstname: String,
    lastname: String,
    role: {
      type: String,
      enum: roles,
      default: roles[roles.length - 1], // lower ranked role
    },
    hasAccess: {
      type: Boolean,
      default: true, // all newly created user can access the app
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

schema.post("findOneAndUpdate", async function(result) {
  // we care only about hasAccess
  const { $set: { hasAccess } = {} } = this._update || {};

  if (hasAccess === false) {
    // we work only if hasAccess has been set to false
    // increase delta to kick out logged in users if hasAccess is false
    await result.updateOne({ delta: result.delta + 1 });
  }
});
schema.post("updateMany", async function(r) {
  // we care only about hasAccess
  const { $set: { hasAccess } = {} } = this._update || {};

  if (hasAccess === false) {
    // we work only if hasAccess has been set to fals

    const docsToUpdate = await this.model.find({
      ...this.getQuery(),
      hasAccess, // we want only the docs affected by the update of hasAccess
    });
    const docsIds = docsToUpdate?.map?.(doc => doc._id) ?? [];
    if (docsIds.length) {
      await this.model.update(
        // using "update" as cannot use "updateMany" again to not generate an endless updateMany post hook
        { _id: { $in: docsIds } },
        { delta: Math.round(Math.random() * 10000) }, // kick out logged in users by changing the delta that is part of the string used in signing the token
        { multi: true }, // update all of them
      );
    }
  }
});

export default schema;
