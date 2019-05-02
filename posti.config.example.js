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
    // https://www.npmjs.com/package/cors#configuring-cors
    // To disable cors, just remove the whole object.
    cors: {
      // Allow cors from every origin.
      origin: '*',
    },

    // https://www.npmjs.com/package/express-rate-limit#configuration
    rateLimiter: {
      // 5 minute rate limit window for requests
      windowMs: 5 * 60 * 1000,
      // limit each IP to 250 requests per windowMs
      max: 250,
      // message to display when requests exceeded the maximum allowed
      message: { error: 'You have exceeded the maximum allowed requests for the given window' },
    },

    // https://www.npmjs.com/package/express-slow-down#configuration
    speedLimiter: {
      // 60 minute speed limit window for requests
      windowMs: 60 * 60 * 1000,
      // delay after 5 requests.
      delayAfter: 5,
      // how many milliseconds do you want to delay per request, after the "delayAfter" has exceeded
      delayMs: 100,
      // maximum delay 30 seconds
      maxDelayMs: 30 * 1000,
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

    // Configurations for queries
    query: {
      // Default limit for queries
      defaultLimit: 100,
      // Maximum allowed limit for queries
      maxLimit: 10000,
    },
  },
};
