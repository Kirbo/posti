import { z } from "zod";

export const configSchema = z.object({
  dialect: z.enum(["postgres", "mysql", "mariadb", "sqlite"]),
  host: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  database: z.string(),
  tablePrefix: z
    .string()
    .regex(/^\w*$/, "tablePrefix must contain only letters, numbers, and underscores")
    .default("posti_"),
  migrate: z.boolean().default(true),
  process: z
    .object({
      chunkSize: z.number().int().positive().default(1000),
      deleteOnComplete: z.boolean().default(true),
    })
    .default({ chunkSize: 1000, deleteOnComplete: true }),
  tables: z
    .array(z.enum(["addresses", "postalcodes", "postalcode_changes"]))
    .default(["addresses", "postalcodes", "postalcode_changes"]),
});

export type PostiConfig = z.infer<typeof configSchema>;
