import { ConfigModule } from '@nestjs/config';

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useValue: <AppConfig>{
    database: {
      driver: process.env.DATABASE_DRIVER || 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'practicum',
      password: process.env.DATABASE_PASSWORD || '12345',
      database: process.env.DATABASE_NAME || 'practicum',
    },
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
    },
  },
};

export interface AppConfig {
  database: AppConfigDatabase;
  server: AppConfigServer;
}

export interface AppConfigDatabase {
  driver: 'postgres' | 'mongodb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfigServer {
  port: number;
}
