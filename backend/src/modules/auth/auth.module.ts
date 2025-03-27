import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from 'src/core/database/typeorm/entities/passwordResetToken.entity';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../jwtToken/jwt.strategy';
import { JwtAuthGuard } from '../jwtToken/jwtAuth.guard';
import { Token } from 'src/core/database/typeorm/entities/token.entity';
import { JwtTokenServiceModule } from 'src/modules/jwtToken/jwtTokenService.module';
import { UsersModule } from 'src/modules/users/users.module';
import { PasswordModule } from 'src/modules/password/password.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordResetToken, Token]),
    JwtTokenServiceModule,
    UsersModule,
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
