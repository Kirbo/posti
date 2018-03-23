module.exports.default = {
  dialect: 'mysql', // http://docs.sequelizejs.com/manual/installation/usage.html#dialects
  host: 'example.com',
  user: 'user',
  password: 'password',
  database: 'database',
  tablePrefix: 'posti_',
  dialectOptions: {}, // http://docs.sequelizejs.com/manual/installation/usage.html#options

  app: {
    chunkSize: 1000, // In how big chunks do we want to insert the data into database.
    concurrency: 5, // Number of concurrent inserts.
    deleteOnComplete: true, // Should the temporary data directory be removed after script finishes.
  },

  tables: {
    addresses: {
      name: 'addresses',
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
    port: 3000,
    tracing: false,
    cacheControl: false,
  },
};
