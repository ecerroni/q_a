import mongoose from "mongoose";
import to from "await-to-js";
import useSearchParams from "mongo-search-parameters";
import { isProduction } from "~/environment";
import { throwIfError } from "../../utils";
import { useModifiers } from "./_utils";

const simpleMethods = [
  "getOneDeleted",
  "getOneWithDeleted",
  "getManyDeleted",
  "getManyWithDeleted",
];

export class BaseModelDataSource {
  // initialize(config) {
  //   super.initialize({
  //     ...config,
  //     debug: !isProduction,
  //   })
  // }
  constructor(cls, model) {
    this[model] = cls[model];
  }

  // READS

  // DATALOADERS

  loadOne(docId = mockObjectId("undefined"), options) {
    // handle null/undefined/not valid docIds
    // Argument passed in must be a single String of 12 bytes or a string of 24 hex characters
    const id =
      docId && mongoose.isValidObjectId(docId)
        ? docId
        : new mongoose.Types.ObjectId();
    return this.context.dataLoaders[this.model].loadOneById(id, options);
  }

  async loadMany(docIds = [], options) {
    const items = await this.context.dataLoaders[this.model].loadManyByIds(
      docIds,
      options,
    );
    return items.filter(item => !!item);
  }

  async loadManyByQuery(query, options) {
    const docs = await this.context.dataLoaders[this.model].loadManyByQuery(
      query,
      options,
    );
    return docs;
  }

  // BASIC QUERIES WITH MODIFIERS

  getById(docId, modifiers) {
    return useModifiers(this[this.model].findById(docId))(modifiers);
  }

  getOne(params, modifiers) {
    return useModifiers(this[this.model].findOne(params))(modifiers);
  }

  // BASIC QUERY WITH MODIFIERS AND SEARCH PARAMETES (i.e { where: MJSON })

  getMany(params, modifiers) {
    const { skip = null } = params || {};
    return skip
      ? useModifiers(
          useSearchParams(this[this.model], { ...params }).skip(skip),
        )(modifiers)
      : useModifiers(useSearchParams(this[this.model], { ...params }))(
          modifiers,
        );
  }
  // SOFT DELETE RELATED QUERIES - NO MODIFIERS, NO SEARCH PARAMETERS
  getOneDeleted(params, modifiers) {
    if (modifiers)
      throwIfError("modifiers are not allowed for:", simpleMethods.join(", "));
    return this[this.model].findOneDeleted(params);
  }
  getOneWithDeleted(params, modifiers) {
    if (modifiers)
      throwIfError("modifiers are not allowed for:", simpleMethods.join(", "));
    return this[this.model].findOneWithDeleted(params);
  }

  async getManyDeleted(params, modifiers) {
    if (modifiers)
      throwIfError("modifiers are not allowed for:", simpleMethods.join(", "));
    return this[this.model].findDeleted(params);
  }
  async getManyWithDeleted(params, modifiers) {
    if (modifiers)
      throwIfError("modifiers are not allowed for:", simpleMethods.join(", "));
    return this[this.model].findWithDeleted(params);
  }

  // WRITES

  // async save(data, conditions = {}) {
  //   const { _id = mongoose.Types.ObjectId(), ...doc } = data
  //   const opts = {
  //     runValidators: true,
  //     setDefaultsOnInsert: true,
  //     upsert: true,
  //     new: true,
  //     context: 'query',
  //   }
  //   const item = await this[this.model].findOneAndUpdate(
  //     { _id, ...conditions },
  //     doc,
  //     opts,
  //   )
  //   return item
  // }

  async save(data, options) {
    const {
      conditions = {},
      new: returnNew = true,
      setDefaultsOnInsert = true,
    } = options || {};
    const { _id, ...doc } = data;
    const opts = {
      runValidators: true,
      setDefaultsOnInsert,
      upsert: false,
      new: returnNew,
      context: "query",
    };
    let item;
    let err;
    if (_id && mongoose.isValidObjectId(_id)) {
      [err, item] = await to(
        this[this.model].findOneAndUpdate({ _id, ...conditions }, doc, opts),
      );
    } else {
      // no _id
      [err, item] = await to(this[this.model].create(doc));
    }
    throwIfError(err);
    return item;
  }

  async deleteById(id) {
    const deletedItem = await this[this.model].findByIdAndDelete(id);
    return deletedItem;
  }
}
