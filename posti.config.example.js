module.exports.default = {
  dialect: 'mysql', // http://docs.sequelizejs.com/manual/installation/usage.html#dialects
  host: 'example.com',
  user: 'user',
  password: 'password',
  database: 'database',
  tablePrefix: 'posti_',
  dialectOptions: {}, // http://docs.sequelizejs.com/manual/installation/usage.html#options

  app: {
    // In how big chunks do we want to insert the data into database.
    chunkSize: 1000,
    // Number of concurrent inserts.
    concurrency: 5,
    // Should the temporary data directory be removed after script finishes.
    deleteOnComplete: true,
  },

  tables: {
    addresses: {
      // Name for the database table.
      name: 'addresses',
      // Should the script use `temp` table for updating or not.
      useTempTable: true,
    },
    postalcodes: {
      name: 'postalcodes',
      useTempTable: true,
    },
    postalcode_changes: {
      name: 'postalcode_changes',
      useTempTable: false,
    },
  },

  server: {
    // In which port should the GraphQL server be run in.
    port: 3000,
    // To enable query tracing, change this to true.
    tracing: false,
    // To enable caching, change this to true.
    cacheControl: false,
    // To disable GraphiQL and Playground, change this to true.
    production: false,

    // https://www.npmjs.com/package/express-rate-limit#configuration
    rateLimiter: {
      // 5 minutes
      windowMs: 5 * 60 * 1000,
      // limit each IP to 250 requests per windowMs
      max: 250,
    },

    // https://www.npmjs.com/package/express-slow-down#configuration
    speedLimiter: {
      // delay after n requests.
      delayAfter: 5,
      // disable delaying - full speed until the max limit is reached
      delayMs: 100,
      // maximum delay
      maxDelayMs: 30000,
    },

    // https://www.apollographql.com/docs/apollo-server/features/graphql-playground#configuring-playground
    playground: {
      // the endpoint where the queries are being sent to
      endpoint: '/graphql',
      // playground settings
      settings: {
        // theme, can either be: light  or  dark
        'editor.theme': 'dark',
      },
    },
  },
};
