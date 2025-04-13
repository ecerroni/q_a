import { typeResolvers, types } from './_type';
import { queryResolvers, queryTypes } from './_query';
import inputTypes from './_input';
import { mutationResolvers, mutationTypes } from './_mutation';
import { typeLoaders } from './_type-loader';

export default {
  types: `
    ${types}
    ${queryTypes}
    ${inputTypes}
    ${mutationTypes}
  `,
  resolvers: Object.assign(queryResolvers, mutationResolvers, typeResolvers),
  loaders: Object.assign({}, typeLoaders),
};
