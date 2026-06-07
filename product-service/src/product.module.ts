import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
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
  controllers: [ProductController],
  providers: [ProductService, JwtStrategy],
  exports: [ProductService],
})
export class ProductModule implements OnApplicationBootstrap {
  constructor(private productService: ProductService) {}

  async onApplicationBootstrap() {
    await this.productService.seedCategories();
  }
}
