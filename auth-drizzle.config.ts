import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/better-auth-schema.ts',
    out: './auth-migrations',
    dialect: 'sqlite',
});
