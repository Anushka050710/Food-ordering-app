import path from 'path';
import { defineConfig } from 'prisma/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as dotenv from 'dotenv';
dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const isCloud = !!(tursoUrl && tursoToken);
const localUrl = 'file:' + path.join(process.cwd(), 'prisma', 'dev.db');

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: isCloud ? `${tursoUrl}?authToken=${tursoToken}` : localUrl,
  },
  migrate: {
    async adapter() {
      if (isCloud) {
        return new PrismaLibSql({ url: tursoUrl!, authToken: tursoToken! });
      }
      return new PrismaLibSql({ url: localUrl });
    },
  },
});
