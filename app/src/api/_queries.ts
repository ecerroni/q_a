import { gql } from '@apollo/client';
import { QA, User } from './_fragments';
import { TypedQueryDocumentNode } from 'graphql';

// REMOTE
export const CONENCTION_QUERY = gql`
  query connection {
    connection
  }
`;

export const AUTH_QUERY = gql`
  query authenticate {
    _checkAuth
  }
` as import('./__generated__/authenticate').authenticateDocument as TypedQueryDocumentNode;

export const CURRENT_USER_QUERY = gql`
  query currentUser {
    currentUser {
      ...UserBasicData
    }
  }
  ${User.fragments.UserBasicData}
` as import('./__generated__/current-user').currentUserDocument;

export const LIST_OWN_QA_QUERY = gql`
  query listOwnQA($params: InputQueryParams!) {
    listOwnQA(params: $params) {
      ...QABasicData
    }
  }
  ${QA.fragments.QAData}
` as import('./__generated__/list-own-qa').listOwnQADocument;
