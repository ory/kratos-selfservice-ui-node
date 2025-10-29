import { defineConfig, env } from "prisma/config";
import { PrismaClient } from '@prisma/client';

import 'dotenv/config';
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
