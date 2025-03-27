import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IJwtPayload } from 'src/core/interfaces/jwtPayload.interface';
import { Token } from 'src/core/database/typeorm/entities/token.entity';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { CreateUserDto } from 'src/modules/users/dto/CreateUser.dto';
import { Repository } from 'typeorm';

@Injectable()
export class JwtTokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async invalidateRefreshToken(refreshToken: string) {
    const token: Token | null = await this.tokenRepository.findOneBy({
      token: refreshToken,
    });

    if (!token) throw new NotFoundException('Token not found');

    token.isValid = false;

    return await this.tokenRepository.save(token);
  }

  async exists(token: string) {
    const tokenExists = await this.tokenRepository.findOneBy({ token: token });
    return tokenExists ? true : false;
  }

  async isTokenExpired(token: string) {
    const decodedJwtAccessToken = await this.decode(token);
    const timeNow = Math.floor(Date.now() / 1000);

    // return true  - has expired
    // return false - hasn't expired
    return timeNow > decodedJwtAccessToken.exp ? true : false;
  }

  async generateTokens(user: User) {
    const payload: IJwtPayload = { userId: user.userId, email: user.email };

    const accessToken = await this.generateJWTAccessToken(payload);
    const refreshToken = await this.generateJWTRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async generateJWTAccessToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXP,
    });
  }

  async generateJWTRefreshToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXP,
    });
  }

  async decode(token: string) {
    return this.jwtService.decode(token);
  }
}
