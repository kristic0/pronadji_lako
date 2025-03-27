import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginResponse } from './login.response';
import { LoginRequest } from './login.request';
import { AuthService } from './auth.service';
import { RequestPasswordResetDto } from './dto/RequestPasswordReset.dto';
import { PasswordResetTokenDto } from './dto/PasswordResetToken.dto';
import { CreateUserDto } from 'src/modules/users/dto/CreateUser.dto';
import { ResetPasswordRequestDto } from './dto/ResetPasswordRequest.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/modules/jwtToken/jwtAuth.guard';
import { User } from 'src/core/database/typeorm/entities/user.entity';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.registerUser(createUserDto);
  }

  @Post('/login')
  @ApiCreatedResponse({
    description: 'Sign in performed successfully',
    type: LoginResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials provided' })
  async login(@Body() loginRequest: LoginRequest, @Res({ passthrough: true }) res): Promise<any> {
    const { user, accessToken, refreshToken } = await this.authService.login(loginRequest);

    res.cookie('token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: this._getRefreshTokenMaxAge(),
      path: '/',
    });

    return {
      user: user,
      accessToken: accessToken,
    };
  }

  @Get('/logout')
  @ApiCreatedResponse({
    description: 'Log out',
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['token'];
    if (!refreshToken) throw new BadRequestException('Token not provided!');

    await this.authService.logout(refreshToken);

    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // You can also use 'lax' depending on your CSRF requirements
      expires: new Date(0), // This removes the cookie
      path: '/', // Ensure it matches the path where the cookie was set TODO
    });

    return { message: 'Successfully logged out!' };
  }

  @Get('/refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res) {
    const refreshToken = req.cookies['token'];
    if (!refreshToken) throw new BadRequestException('Token not provided!');

    const newTokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('token', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'strict',
      maxAge: this._getRefreshTokenMaxAge(),
      path: '/',
    });

    return { accessToken: newTokens.accessToken };
  }

  @Post('/request-password-reset')
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Get('/validate-reset-token')
  async resetTokenValidation(@Query() query: PasswordResetTokenDto) {
    return await this.authService.validateResetToken(query.token);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordRequestDto: ResetPasswordRequestDto) {
    const isValid = await this.authService.validateResetToken(resetPasswordRequestDto.token);
    if (!isValid) throw new UnauthorizedException('The token has expired!');

    return this.authService.resetPassword(
      resetPasswordRequestDto.token,
      resetPasswordRequestDto.newPassword,
    );
  }

  private _getRefreshTokenMaxAge(): number {
    // 30 days
    const days = parseInt(process.env.JWT_REFRESH_EXP, 10) || 30;
    return days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  }
}
