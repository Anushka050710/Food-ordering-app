import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    let adapter: PrismaLibSql;
    if (tursoUrl && tursoToken) {
      // Production: Turso cloud
      adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    } else {
      // Local: SQLite file
      const DB_URL = 'file:' + path.join(process.cwd(), 'prisma', 'dev.db');
      adapter = new PrismaLibSql({ url: DB_URL });
    }
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
