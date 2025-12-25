import { z } from "zod";

// Define the schema as an object with all of the env
// variables and their types
const envSchema = z.object({
  CMU_USERNAME: z.string(),
  CMU_PASSWORD: z.string(),
  BROWSERLESS_ENDPOINT: z.string().default("ws://browserless:8080"),
  S3_ENDPOINT: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),
  RAILWAY_TOKEN: z.string(),

  // The NOTIF_CONFIG is a comma-separated list of project names and service names.
  // The project names and service names are separated by a slash (/).
  // Example: "project1/service1,project2/service2"
  NOTIF_CONFIG: z.string(),
});

// Validate `process.env` against our schema and return the result
const env = envSchema.parse(process.env);

// Export the result so we can use it in the project
export default env;
