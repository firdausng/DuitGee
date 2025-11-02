import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './src/lib/server/db/schema';
// import Database from 'better-sqlite3';
import {betterAuthOptions} from "./src/lib/server/better-auth/options";

// const sqlite = new Database('./temp-betterauth.db'); // Your local db file path
// const db = drizzle(sqlite, {schema});

const db = drizzle({ connection: {
        url: 'file:temp-betterauth.db'
    }});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    ...betterAuthOptions,
});
