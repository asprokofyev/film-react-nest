import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';

import { configProvider } from './app.config.provider';
import { DatabaseModule } from './database/database.module';
import { FilmsController } from './films/films.controller';
import { FilmsService } from './films/films.service';
import { LoggerModule } from './logger/logger.module';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { FilmsRepository } from './repository/films.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
      },
    }),
    DatabaseModule,
    LoggerModule,
  ],
  controllers: [FilmsController, OrderController],
  providers: [configProvider, FilmsRepository, FilmsService, OrderService],
})
export class AppModule {}
