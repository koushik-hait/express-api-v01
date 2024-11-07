// import { drizzle } from "drizzle-orm/neon-http";
// const db = drizzle(process.env.POSTGRESS_URI);
// export { db };

// POSTGRESS_URI_LOCAL

import { drizzle } from "drizzle-orm/node-postgres";
const db = drizzle(process.env.POSTGRESS_URI_LOCAL);
export { db };
