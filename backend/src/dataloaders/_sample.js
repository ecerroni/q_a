import DataLoader from "dataloader";
// import { mongoModels } from '../connectors/mongo';
import { dataQuery, dataloader } from "./_helpers";

// const modelNames = Object.keys(sources)
// console.log({modelNames});
export default modelNames => {
  return {
    ...modelNames.reduce(
      (obj, name) => ({
        ...obj,
        [name]: {
          loadOne: new DataLoader(ids =>
            dataloader({ ids, Model: Partnership }),
          ),
          // loadMany: new DataLoader(ids => dataloader({ ids, Model: Partnership })),
          loadManyByQuery: new DataLoader(queries =>
            dataQuery({ queries, Model: Collection }),
          ),
          loadOneByQuery: new DataLoader(queries =>
            dataQuery({ queries, Model: Collection, findOne: true }),
          ),
        },
      }),
      {},
    ),
  };
};
