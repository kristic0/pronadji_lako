import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequest } from './login.request';
import { UsersService } from 'src/modules/users/users.service';
import { PasswordService } from 'src/modules/password/password.service';
import { PasswordResetToken } from 'src/core/database/typeorm/entities/passwordResetToken.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Token } from 'src/core/database/typeorm/entities/token.entity';
import { JwtTokenService } from 'src/modules/jwtToken/jwtTokenService.service';
import { CreateUserDto } from 'src/modules/users/dto/CreateUser.dto';
import { RequestPasswordResetDto } from './dto/RequestPasswordReset.dto';
import { User } from 'src/core/database/typeorm/entities/user.entity';
import { SearchService } from '../search/search.service';
@Injectable()
export class AuthService {
  private readonly MAX_NUMBER_OF_USER_SESSIONS = 6;

  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  async login(loginRequest: LoginRequest): Promise<any> {
    const user = await this.usersService.validateUser(loginRequest.email, loginRequest.password);

    const { accessToken, refreshToken } = await this.jwtTokenService.generateTokens(user);

    await this._validateUserSessions(user);
    await this._saveToken(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const invalidated = await this.jwtTokenService.invalidateRefreshToken(refreshToken);
    if (!invalidated) throw new InternalServerErrorException('Failed to invalidate token!');

    return invalidated;
  }

  async refreshTokens(currentRefreshToken: string) {
    const exists = await this.jwtTokenService.exists(currentRefreshToken);
    if (!exists) throw new NotFoundException('Token not found!');

    const isTokenExpired: boolean = await this.jwtTokenService.isTokenExpired(currentRefreshToken);
    if (isTokenExpired) throw new UnauthorizedException('Refresh token has expired');

    const invalidated = await this.jwtTokenService.invalidateRefreshToken(currentRefreshToken);
    if (!invalidated) throw new InternalServerErrorException('Failed to invalidate token!');

    const decoded = await this.jwtTokenService.decode(currentRefreshToken);
    if (!decoded) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findOneById(decoded.userId);
    const { accessToken, refreshToken } = await this.jwtTokenService.generateTokens(user);

    await this._saveToken(user, refreshToken);

    return { accessToken, refreshToken };
  }

  async requestPasswordReset(email: string) {
    const REQUEST_LIMIT = 3;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const unactivatedTokens: PasswordResetToken[] = await this._findUnactivatedResetTokensByEmail(
      user.email,
    );

    if (unactivatedTokens.length >= REQUEST_LIMIT) {
      return { message: 'Reached the limit, please try again in 10 minutes.' };
    }

    const token = this._createResetPasswordToken(user.email);
    if (!token) throw new InternalServerErrorException("Couldn't create reset token!");

    //
    // SEND MAIL FROM HERE
    //

    return { message: 'An email with the reset link has been sent to your email.' };
  }

  async validateResetToken(token: string): Promise<boolean> {
    const now = new Date();

    const tokenObj = await this.passwordResetTokenRepository.findOneBy({
      token: token,
    });
    if (!tokenObj) throw new UnauthorizedException("Token invalid or doesn't exist");

    return new Date(tokenObj.expires) > now && !tokenObj.activated;
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenObj = await this.passwordResetTokenRepository.findOneBy({
      token: token,
    });
    if (!tokenObj) throw new BadRequestException('Invalid or expired token');

    const user = await this.usersService.findOneByEmail(tokenObj.email);
    if (!user) throw new BadRequestException('User not found');

    const passwordHashed = await this.passwordService.hashPassword(newPassword);

    const res = await this.usersService.updatePassword(user.userId, passwordHashed);
    if (res.affected === 0) throw new InternalServerErrorException('Password reset failed');

    const tokenStateChange = await this.passwordResetTokenRepository.update(tokenObj.id, {
      activated: true,
    });
    if (!tokenStateChange) throw new InternalServerErrorException('Failed to update!');

    return { message: 'Successfully reset the password' };
  }

  private async _findUnactivatedResetTokensByEmail(email: string): Promise<PasswordResetToken[]> {
    //
    // Return unactivated and tokens that haven't expired
    //
    const tokens = await this.passwordResetTokenRepository.findBy({
      email: email,
      activated: false,
    });
    const validTokens = tokens.filter((token) => new Date(token.expires) > new Date());

    return validTokens;
  }

  private async _validateUserSessions(user: User) {
    const activeUserSessions = await this.tokenRepository.countBy({
      user: user,
      isValid: true,
    });

    if (activeUserSessions + 1 > this.MAX_NUMBER_OF_USER_SESSIONS)
      throw new ForbiddenException('Number of sessions has reached its limit!');
  }

  private async _saveToken(user: User, refreshToken: string) {
    const tokenObject = new Token(user, refreshToken, true);
    const token = await this.tokenRepository.save(tokenObject);
    if (!token) throw new InternalServerErrorException('Saving the token failed!');

    return token;
  }

  private _validateEmailDomain(email: string) {
    const validEmails = [
      'gmail.com',
      'outlook.com',
      'yahoo.com',
      'icloud.com',
      'aol.com',
      'zoho.com',
      'protonmail.com',
      'yandex.com',
      'yandex.ru',
      'hotmail.com',
    ];

    let isValidDomain = false;
    const userEmailDomain = email.split('@')[1];

    validEmails.forEach((validDomain) => {
      if (userEmailDomain === validDomain) isValidDomain = true;
    });

    if (!isValidDomain) throw new BadRequestException('Provided email is invalid!');
  }

  private async _createResetPasswordToken(email: string): Promise<PasswordResetToken> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const createdAt = new Date();
    const resetTokenExpires = new Date();
    resetTokenExpires.setMinutes(resetTokenExpires.getMinutes() + 10);

    const tokenObj = new PasswordResetToken({
      email: email,
      token: resetToken,
      createdAt: createdAt.toISOString(),
      expires: resetTokenExpires.toISOString(),
    });

    return await this.passwordResetTokenRepository.save(tokenObj);
  }
}
