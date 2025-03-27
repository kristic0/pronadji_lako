import {
  Body,
  Controller,
  Headers,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Put,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { JwtAuthGuard } from 'src/modules/jwtToken/jwtAuth.guard';
import { IJwtUserRequest } from 'src/core/interfaces/jwtUserRequest.interface';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SafeUser } from './dto/SafeUser.response.dto';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('all')
  async getAllUsers(): Promise<SafeUser[]> {
    // if (process.env.ENV_VAR === 'prod') {
    //   throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    // }
    const users = await this.usersService.findAll();
    return users.map((user) => SafeUser.fromUser(user));
  }

  @Get(':id')
  async getUser(@Param('id') id): Promise<SafeUser> {
    return SafeUser.fromUser(await this.usersService.findOneById(id));
  }

  @Get('')
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization token for accessing user data',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  async findUserById(@Req() req: IJwtUserRequest): Promise<User> {
    try {
      if (!req.user) return;
      return await this.usersService.findOneById(req.user.userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Put('/update')
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization token for accessing user data',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: IJwtUserRequest, @Body() body: UpdateUserDto) {
    // !!!
    // Passport.js attaches the return from validate method to the req object !!!
    // !!!
    if (!req.user) return;
    try {
      return await this.usersService.updateUserData(req.user.userId, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Put('/updateProfileImage')
  @ApiHeader({
    name: 'Authorization',
    required: true,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfileImage(
    @Headers('Authorization') headers: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const token = headers.split(' ')[1];
    try {
      return await this.usersService.updateUserImage(token, image);
    } catch (error) {
      throw error;
    }
  }
}
