import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordService } from 'src/modules/password/password.service';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { CreateUserDto } from './dto/CreateUser.dto';
import { JwtTokenService } from 'src/modules/jwtToken/jwtTokenService.service';
import { MinioService } from 'src/core/minio/minioClient.service';
import { CityService } from 'src/modules/city/city.service';
import { SearchService } from '../search/search.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passwordService: PasswordService,
    private jwtTokenService: JwtTokenService,
    private cityService: CityService,
    private minioService: MinioService,
    private searchService: SearchService,
  ) {}

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { userId: id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { email: email },
    });

    // if email/user doesn't exist, return null, don't return "user not exist" message
    if (!user) user = null;

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updatePassword(userId: number, password: string) {
    const res = await this.usersRepository.update(userId, {
      password: password,
    });
    return res;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const passwordHashed = await this.passwordService.hashPassword(createUserDto.password);

      const city = await this.cityService.findCityById(createUserDto.cityId);
      if (!city) throw new NotFoundException('City not found');

      const address = createUserDto.address + ' ' + city.cityName;
      let coordinates = await this.searchService.findCoordinates(address);

      if (coordinates.lat == 0 && coordinates.long == 0)
        coordinates = await this.searchService.findCoordinates(city.cityName);

      const userObj = new User({
        name: createUserDto.name,
        lastname: createUserDto.lastname,
        email: createUserDto.email,
        password: passwordHashed,
        city: city,
        address: createUserDto.address,
        isNanny: createUserDto.isNanny,
        lat: coordinates.lat,
        long: coordinates.long,
      });

      return await this.usersRepository.save(userObj);
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
  }

  async updateUserData(userId: number, updateValues: UpdateUserDto): Promise<User> {
    let user = await this.findOneById(userId);

    for (let key of Object.keys(updateValues)) {
      if (user[key] !== updateValues[key]) {
        user[key] = updateValues[key];
        return await this.usersRepository.save(user);
      }

      return user;
    }
  }

  async updateUserImage(token: string, image: Express.Multer.File) {
    const bucketName = 'picture-store';
    const decodedToken = await this.jwtTokenService.decode(token);
    console.log(decodedToken);
    const fileName = `${decodedToken.user.userId}/profile-${Date.now()}`;

    const userProfileImage = await this.minioService.uploadUserImage(bucketName, fileName, image);
    const updateValues: UpdateUserDto = {
      profileImage: userProfileImage.profileImage,
    };
    const updateUser = await this.updateUserData(decodedToken.user.userId, updateValues);

    if (!updateUser) return;

    return userProfileImage;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('User not found!');

    const isPasswordValid = await this.passwordService.comparePasswords(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Incorrect password!');

    return user;
  }
}
