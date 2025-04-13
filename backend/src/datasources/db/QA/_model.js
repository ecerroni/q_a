// import { useModifiers } from '../_utils'
import to from "await-to-js";
import model from "./_name";
import { BaseModelDataSource } from "../_base-model";
import { throwIfError } from "../../../utils";

class Model extends BaseModelDataSource {
  constructor(args) {
    super(args, model);
    super.model = model;
  }

  // custom: not inherited from base model
  async update(data) {
    const { userId: user, _id, ...doc } = data;
    if (!_id) return null;

    const [err, item] = await to(
      super.save({
        _id,
        ...doc,
        user,
      }),
    );
    throwIfError(err);
    return item;
  }
}

export default Model;
