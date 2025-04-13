import { useAtomValue } from 'jotai';
import {
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  DocumentNode,
} from '@apollo/client';
import {
  queryTracker,
  refetchQueriesMapping,
  RefetchQuerySingleQueryVariation,
} from '@/atoms';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useTypedQuery } from './useTypedQuery';
import * as queries from '@/api/_queries';

const importedQueries: Record<string, any> = queries;
const getQueryOperationNameValue = (definitions: DocumentNode['definitions']) =>
  definitions.find(d => d.kind === 'OperationDefinition')?.name?.value;

const useTrackedTypedQuery = <
  ResponseData,
  Variables extends OperationVariables
>(
    query: TypedDocumentNode<ResponseData, Variables>,
    options: QueryHookOptions<ResponseData, Variables>
  ): QueryResult<ResponseData, Variables> => {
  const queryName = getQueryOperationNameValue(query.definitions);
  // const fn = useRecoilCallback(
  //   ({ set }) =>
  //     (
  //       atom: RecoilState<RefetchQuerySingleQueryVariation[]>,
  //       record: RefetchQuerySingleQueryVariation[]
  //     ) => {
  //       set<RefetchQuerySingleQueryVariation[]>(atom, record);
  //     }
  // );

  if (queryName) {
    queryTracker.addOne({
      key: queryName,
      variables: options.variables ?? {},
    });
  }
  return useTypedQuery(query, options);
};

export default () => {
  return {
    addTrackedQueries: queryTracker.addMany,
    useTrackedTypedQuery,
    useRefetchTrackedQueries: (array: DocumentNode[]) =>
      array.reduce((arr, query: DocumentNode) => {
        const name = getQueryOperationNameValue(query.definitions);
        if (!name) return arr;
        const queryState: RefetchQuerySingleQueryVariation[] =
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useAtomValue(refetchQueriesMapping[name]) ?? [];
        if (!name) return arr;
        return [
          ...arr,
          ...queryState.map(query => ({
            query: Object.values(importedQueries).find(
              (q: TypedDocumentNode) =>
                getQueryOperationNameValue(q.definitions) === name
            ),
            variables: query.variables,
          })),
        ] as DocumentNode[];
      }, [] as DocumentNode[]),
  };
};
