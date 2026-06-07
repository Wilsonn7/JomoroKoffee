import { ConflictException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.users.findFirst({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    await this.prisma.users.create({
      data: {
        first_name: registerDto.first_name,
        last_name: registerDto.last_name,
        email: registerDto.email,
        password: registerDto.password, // plain text as requested
        role: 'CUSTOMER', // default role
      },
    });

    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.users.findFirst({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };
  }
}
