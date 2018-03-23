const queries = `
  Addresses: [Address]
  PostalCodes: [PostalCode]
  PostalCodeChanges: [PostalCodeChanges]
`;

const Query = `
type Query {
  ${queries}
}
`;

export default Query;
export {
  queries,
};
