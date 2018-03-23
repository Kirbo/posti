import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import { makeExecutableSchema } from 'graphql-tools';
import expressPlayground from 'graphql-playground-middleware-express';

import { findDatabaseConfig } from './utils';
import postiConfig from './config';

import typeDefs from './graphql';
import resolvers from './graphql/Resolvers';

const configPath = findDatabaseConfig();
global.config = require(configPath).default;
global.postiConfig = postiConfig;

const serverConfig = {
  port: 3000,
  tracing: true,
  cacheControl: true,
  production: false,
  ...global.config.server,
};

const app = express();

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

app.use(compression());
app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
  tracing: serverConfig.tracing,
  cacheControl: serverConfig.cacheControl,
}));
if (!serverConfig.production) {
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
}

app.listen(serverConfig.port, () => {
  console.info(`GraphQL endpoint:         http://localhost:${serverConfig.port}/graphql`);
  if (!serverConfig.production) {
    console.info('----');
    console.info('For development:');
    console.info(`  GraphiQL served in:     http://localhost:${serverConfig.port}/graphiql`);
    console.info(`  Playground served in:   http://localhost:${serverConfig.port}/playground`);
  }
});
