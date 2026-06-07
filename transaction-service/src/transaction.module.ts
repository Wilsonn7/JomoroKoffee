import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jomoro_secret_key_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, JwtStrategy],
  exports: [TransactionService],
})
export class TransactionModule {}
