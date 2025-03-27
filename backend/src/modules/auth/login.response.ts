import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/core/database/typeorm/entities/user.entity';

export class LoginResponse {
  @ApiProperty()
  user: User;

  @ApiProperty()
  accessToken: Object;

  constructor(user: User, accessToken: Object) {}

  static fromUser(user: User, accessToken: Object): LoginResponse {
    return new LoginResponse(user, accessToken);
  }
}
