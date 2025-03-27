import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from 'src/core/database/typeorm/entities/passwordResetToken.entity';
import { PasswordService } from './password.service';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetToken])],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
