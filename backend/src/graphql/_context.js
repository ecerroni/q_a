import { APP, defaultLocale } from "~/config";
import initLoaders from "../dataloaders";
import * as datamemo from "../datamemo";

export default async ({ res, req, dataSources }) => {
  // Attach additional properties to context if needed

  const dataLoaders = initLoaders(Object.keys(dataSources));
  const { raw: { user, app_version } = {} } = req;
  const memoId = Math.random();
  const dataMemo = Object.entries(datamemo).reduce((obj, [key, value]) => {
    return {
      ...obj,
      [key]: Object.entries(value).reduce(
        (o, [k, v]) => ({
          ...o,
          [k]() {
            const combinedArgs = [...arguments, memoId]; // eslint-disable-line prefer-rest-params
            return v(...combinedArgs);
          },
        }),
        {},
      ),
    };
  }, {});
  // console.log(app_version);
  const langHeaderName = APP.PREFIX + APP.NAMESPACE + "-lang";
  const language = req?.headers[langHeaderName] ?? defaultLocale; // check lang header
  return {
    user,
    app_version,
    res,
    req,
    dataLoaders,
    language,
    locale: language,
    dataMemo,
    dataSources: Object.entries(dataSources).reduce((obj, [key, value]) => {
      const withContext = Object.assign(value, {
        context: {
          dataLoaders,
          dataMemo,
          user,
          res,
          req,
        },
      });
      return {
        ...obj,
        [key]: withContext,
      };

      // return {
      //   ...obj,
      //   [key]: Object.assign(withContext, {
      //     // ...dataLoaders[key],
      //     // memo: dataMemo[key],
      //   }),
      // };
    }, {}),
  };
};
