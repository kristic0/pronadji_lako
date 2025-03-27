import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { JwtTokenServiceModule } from 'src/modules/jwtToken/jwtTokenService.module';
import { MinioClientModule } from 'src/core/minio/minioClient.module';
import { PasswordModule } from 'src/modules/password/password.module';
import { CityModule } from 'src/modules/city/city.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtTokenServiceModule,
    MinioClientModule,
    PasswordModule,
    CityModule,
    SearchModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
