import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as relations from './relations';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export type Database = ReturnType<typeof drizzle>;

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Database => {
        const connectionString: string | undefined =
          configService.get<string>('DATABASE_URL');

        if (!connectionString) {
          throw new Error('DATABASE_URL is not defined');
        }

        try {
          const pool = new Pool({
            connectionString: connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          });

          // Test connection
          pool.on('error', (err) => {
            console.error('❌ Unexpected database pool error:', err);
          });

          return drizzle(pool, { schema: { ...schema, ...relations } });
        } catch (error) {
          console.error('❌ Error creating database connection:', error);
          throw error;
        }
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
