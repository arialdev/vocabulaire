import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/data/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
