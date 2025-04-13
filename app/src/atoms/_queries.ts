import * as queries from '@/api/_queries';
import { DocumentNode } from '@apollo/client';
import { atom, useAtom, WritableAtom } from 'jotai';

export type RefetchQuerySingleQueryVariation = {
  queryKey: string;
  variables: Record<string, any>;
  options?: Record<string, any>;
};

export type RefetchQueryState = {
  queryName: string;
  queries: RefetchQuerySingleQueryVariation[];
};

const getQueryOperationNameValue = (definitions: DocumentNode['definitions']) =>
  definitions.find(d => d.kind === 'OperationDefinition')?.name?.value;

export const refetchQueriesMapping: Record<
  string,
  WritableAtom<
    RefetchQuerySingleQueryVariation[],
    unknown[],
    RefetchQuerySingleQueryVariation[]
  >
> = Object.values(queries).reduce((o, i) => {
  const queryName = getQueryOperationNameValue(i.definitions);
  if (!queryName) return o;
  const queryState = atom([]);
  return { ...o, [queryName]: queryState };
}, {});

const addMany = (
  array: {
    key: string;
    variables: Record<string, any>;
    options?: Record<string, any>;
  }[]
) => {
  array.forEach(function (element) {
    const { key: queryName, variables = {}, options = {} } = element || {};
    const targetQuery = refetchQueriesMapping[queryName];
    if (!targetQuery) return;

    const queryKey = queryName + JSON.stringify(variables);
    const [queryAtomValue, setQueryAtomValue] = useAtom(targetQuery);
    const queryKeyExistsInTargetQueryAtom = !!queryAtomValue.find(
      query => query.queryKey === queryKey
    );
    if (queryKeyExistsInTargetQueryAtom) return;
    const existingQueries: RefetchQuerySingleQueryVariation[] = [
      ...queryAtomValue,
    ];
    const newQuery: RefetchQuerySingleQueryVariation = {
      queryKey: queryKey,
      variables,
      options,
    };
    setQueryAtomValue([...new Set([...existingQueries, newQuery])]);
  });
};
export const queryTracker = {
  addMany,
  addOne: (record: {
    key: string;
    variables: Record<string, any>;
    options?: Record<string, any>;
  }) => addMany([record]),
};
