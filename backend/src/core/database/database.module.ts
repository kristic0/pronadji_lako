import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          entities: [__dirname + '/typeorm/entities/*.entity{.ts,.js}'],
          synchronize: process.env.NODE_ENV === 'production' ? false : true,
          logging: ['error', 'warn', 'info', 'log'],
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
