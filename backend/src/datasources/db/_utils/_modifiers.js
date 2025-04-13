export default model => ({ select = "", lean = true } = {}) =>
  lean
    ? model
        .select(select)
        .lean()
        .exec()
    : model.select(select).exec();
