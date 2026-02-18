import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig, configProvider } from '../app.config.provider';
import { FilmEntity, ScheduleEntity } from '../films/entities/films.entities';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: ['CONFIG'],
      useFactory: (config: AppConfig) => ({
        type: config.database.driver,
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        entities: [FilmEntity, ScheduleEntity],
        synchronize: false,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([FilmEntity, ScheduleEntity]),
  ],
  providers: [configProvider],
  exports: [configProvider, TypeOrmModule],
})
export class DatabaseModule {}
