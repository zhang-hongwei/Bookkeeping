import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

// Load environment variables
dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "test") {
  console.log("current ENV:", process.env.NODE_ENV);
  connectionString = process.env.DATABASE_TEST_URL;
}

if (!connectionString)
  throw new Error(
    "`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment"
  );

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: "postgresql",
  // Drizzle migrations output directory
  out: "./src/database/migrations",

  // Path to your schema sources
  schema: ["./src/database/schema"],
  strict: true,
} satisfies Config;
