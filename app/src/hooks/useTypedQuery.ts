import {
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  useQuery,
} from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

export function useTypedQuery<
  ResponseData,
  Variables extends OperationVariables
>(
  query: TypedDocumentNode<ResponseData, Variables>,
  options: QueryHookOptions<ResponseData, Variables>
): QueryResult<ResponseData, Variables> {
  return useQuery(query, options);
}
