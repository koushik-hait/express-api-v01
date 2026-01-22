import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TARSO_DATABASE_PLATFORM_API_TOKEN,
});
const tursoDB = drizzle({ client });
