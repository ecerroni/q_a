import { gql } from '@apollo/client';

export const User = {
  fragments: {
    UserBasicData: gql`
      fragment UserBasicData on User {
        _id
        name
        email
        username
      }
    `,
  },
};

export const QA = {
  fragments: {
    QAData: gql`
      fragment QABasicData on QA {
        _id
        question
        answer
        createdBy {
          ...UserBasicData
        }
      }
      ${User.fragments.UserBasicData}
    `,
  },
};
