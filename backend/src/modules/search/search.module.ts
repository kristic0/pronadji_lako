import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { City } from 'src/core/database/typeorm/entities/city.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { User } from 'src/core/database/typeorm/entities/user.entity';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [TypeOrmModule.forFeature([City, User]), HttpModule],
  exports: [SearchService],
})
export class SearchModule {}
