import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PasswordModule } from './modules/password/password.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { SeederModule } from '../seeder/seeder.module';
import { SearchModule } from './modules/search/search.module';
import { JwtTokenServiceModule } from './modules/jwtToken/jwtTokenService.module';
import { CityModule } from './modules/city/city.module';
import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    // Ensures it's available across all modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local.dev',
    }),
    DatabaseModule,
    UsersModule,
    NewsletterModule,
    PasswordModule,
    AuthModule,
    SeederModule,
    SearchModule,
    JwtTokenServiceModule,
    CityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
