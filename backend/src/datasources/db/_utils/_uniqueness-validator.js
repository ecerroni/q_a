import translate from "translate-js";
import { log } from "~/utils";

export default ({ required, scope }) => {
  // required = false will allow null dulplicate field values
  // this has been tested only with:
  // - Model.create()
  // - findOneAndUpdate() operation
  // with options:
  /*
  {
      runValidators: true,
      setDefaultsOnInsert: true,
      upsert: true,
      new: true,
      context: 'query',
    }
  */
  return {
    validate: {
      propsParameter: true,
      async validator(value, { path }) {
        const isUpdate = !!this.getUpdate;
        const query = !scope ? "findOne" : "find";
        let doc = !isUpdate
          ? await this.constructor[query]({ [path]: value }) // it's a create/save
          : await this.model[query]({ [path]: value }); // it's an update
        if (scope ? doc?.length : doc) {
          if (isUpdate) {
            const { _id: updateDocId } = this._conditions || {};
            if (updateDocId?.toString() === doc._id?.toString()) {
              return true;
            }
            // check scoped constraints
            if (scope) {
              if (!this._update?.["$set"]?.[scope])
                log.warn(
                  // eslint-disable-next-line max-len
                  `[UNIQUENESS_VALIDATOR][SCOPE][ERROR] Monitoring scope: ${scope}, but requested update is missing ${scope} in the update object ${JSON.stringify(
                    { ...this?._update?.["$set"] },
                  )}`,
                );
              if (
                !doc
                  .find(d => {
                    return (
                      d?._id?.toString() !== updateDocId?.toString() &&
                      d?.[scope]?.toString() ===
                        this._update?.["$set"]?.[scope]?.toString()
                    );
                  })
                  ?.[scope]?.toString()
              ) {
                return true;
              }
              return false;
            }
          }
          if (this.id?.toString() === doc._id?.toString()) {
            return true;
          }
          if (scope) {
            if (!this[scope])
              log.warn(
                `[UNIQUENESS_VALIDATOR][CREATE][SCOPE][ERROR] Monitoring scope: ${scope}, but requested create is missing ${scope} in the create object`, // eslint-disable-line max-len
              );
            if (
              !doc
                .find(d => d?.[scope]?.toString() === this[scope]?.toString())
                ?.[scope]?.toString()
            )
              return true;
          }
          return false;
        }
        return true;
      },
      message: ({ value }) => {
        return `${value}___exists`; // this will be used in this format in backend/src/utils/validations/_user-input-validation.js
      },
    },
    ...(required && { required: [true, "this field is required"] }), // this is applied only on create/save. Updates will skip it
  };
};
