import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SearchParamDto } from './dto/SearchParam.dto';
import { SearchService } from './search.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('search')
@ApiTags('Search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async searchForNanny() {}

  @Get('/coordinates')
  async findCoordinates(@Query('q') query: string) {
    const res = await this.searchService.findCoordinates(query);
    return res;
  }

  // @Get('/suggest/post-office')
  // async suggestPostOffice(@Query() query: SearchParamDto) {
  //   return await this.searchService.suggestPostOffice(query);
  // }

  @Get('/city')
  async findCity(@Query() query: SearchParamDto) {
    if (Object.keys(query).length === 0) {
      return await this.searchService.findCity();
    }
    return await this.searchService.findCity(query);
  }

  @Get('/city/:id')
  async findCityById(@Param('id') id) {
    return await this.searchService.findCityById(id);
  }

  @Get('/street')
  async findStreet(@Query() query: SearchParamDto) {
    return await this.searchService.findStreet(query);
  }

  @Get('/nearbyNannyFor/:id')
  async findNannyNearby(@Param('id') id) {
    return await this.searchService.findNannyNearby(id);
  }
}
