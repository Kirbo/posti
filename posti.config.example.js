export default {
  dialect: "postgres",       // postgres, mysql, mariadb, sqlite
  host: "localhost",
  port: 5432,
  user: "posti",
  password: "posti",
  database: "posti",
  tablePrefix: "posti_",
  migrate: true,             // Auto-run migrations on startup (disable with false)

  process: {
    chunkSize: 1000,         // Rows per bulk insert
    deleteOnComplete: true,  // Remove temp files after processing
  },

  // Which tables to process (default: all three)
  tables: ["addresses", "postalcodes", "postalcode_changes"],
};
