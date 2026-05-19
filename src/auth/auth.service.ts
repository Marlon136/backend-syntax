import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const passMatches = await bcrypt.compare(password, user.password);
    if (!passMatches) {
      return null;
    }
    const { password: _password, ...result } = user;
    return result;
  }

  async login(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: { email: string; password: string; name?: string }) {
    const { email, password, name } = createUserDto;
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, password: hashed, name });
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isPro: user.isPro,
      },
    };
  }
}
