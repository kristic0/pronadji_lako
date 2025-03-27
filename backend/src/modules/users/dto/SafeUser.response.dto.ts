import { ApiProperty } from '@nestjs/swagger';
import { City } from 'src/core/database/typeorm/entities/city.entity';
import { Rating } from 'src/core/database/typeorm/entities/rating.entity';
import { User } from 'src/core/database/typeorm/entities/user.entity';

export class SafeUser {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  isNanny: boolean;

  @ApiProperty()
  city: City;

  @ApiProperty()
  profileImage: string;

  @ApiProperty()
  ratings: Rating[];

  @ApiProperty()
  pricePerHour: number;

  constructor(
    userId: number,
    name: string,
    lastname: string,
    isNanny: boolean,
    city: City,
    profileImage: string,
    ratings: Rating[],
    pricePerHour: number,
  ) {
    this.userId = userId;
    this.name = name;
    this.lastname = lastname;
    this.isNanny = isNanny;
    this.city = city;
    this.profileImage = profileImage;
    this.ratings = ratings;
    this.pricePerHour = pricePerHour;
  }

  static fromUser(user: User): SafeUser {
    return new SafeUser(
      user.userId,
      user.name,
      user.lastname,
      user.isNanny,
      user.city,
      user.profileImage,
      user.ratings,
      user.pricePerHour,
    );
  }
}
