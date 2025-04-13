import { gql } from '@apollo/client';
import { QA } from './_fragments';

// REMOTE
export const LOGIN_MUTATION = gql`
  mutation login($userCredentials: userCredentials!) {
    login(input: $userCredentials)
  }
` as import('./__generated__/login').loginDocument;

export const ADD_QA_MUTATION = gql`
  mutation addQA($input: addQAInput!) {
    addQA(input: $input) {
      ...QABasicData
    }
  }
  ${QA.fragments.QAData}
` as import('./__generated__/add-qa').addQADocument;

export const UPDATE_QA_MUTATION = gql`
  mutation updateQA($input: updateQAInput!) {
    updateQA(input: $input) {
      ...QABasicData
    }
  }
  ${QA.fragments.QAData}
` as import('./__generated__/update-qa').updateQADocument;

export const DELETE_QA_BY_ID_MUTATION = gql`
  mutation deleteQAById($_id: ObjectID!) {
    deleteQAById(_id: $_id) {
      ...QABasicData
    }
  }
  ${QA.fragments.QAData}
` as import('./__generated__/delete-qaby-id').deleteQAByIdDocument;

export const SUGGEST_AI_ANSWER_MUTATION = gql`
  mutation suggestAiAnswer($question: String!) {
    suggestAiAnswer(question: $question)
  }
` as import('./__generated__/suggest-ai-answer').suggestAiAnswerDocument;
