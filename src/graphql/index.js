/*
import Types from './Types';
import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';

const schema = `
${Types}
${Query}
${Mutation}
${Subscription}

schema {
  query: Query
  mutations: Mutation
  subscription: Subscription
}
`;
*/
import Scalars from './Scalars';
import Types from './Types';
import Query from './Query';

const schema = `
${Scalars}
${Types}
${Query}

schema {
  query: Query
}
`;

export default schema;
