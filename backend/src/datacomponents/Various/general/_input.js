export default `
input InputQueryParams {
  limit: Int
  skip: Int
  sort: [String]
  where: MJSON
}
`;
