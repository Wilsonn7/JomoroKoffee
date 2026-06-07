import { Module } from '@nestjs/common';
import { TransactionModule } from './transaction.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, TransactionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
