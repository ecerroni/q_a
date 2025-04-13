export default `
  input addQAInput {
    question: String!
    answer: String!
  }

  input updateQAInput {
    _id: ObjectID!
    question: String!
    answer: String!
  }
`;
