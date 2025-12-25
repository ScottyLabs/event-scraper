import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  CMU_USERNAME: z.string(),
  CMU_PASSWORD: z.string(),
  BROWSERLESS_ENDPOINT: z.string().default("ws://browserless:8080"),
  RAILWAY_TOKEN: z.string(),
  NOTIF_CONFIG: z.string(),
});

// Validate `process.env` against our schema and return the result
const env = envSchema.parse(process.env);

// Export the result so we can use it in the project
export default env;
