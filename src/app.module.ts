import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './transactions/transactions.module';
import { BanksModule } from './banks/banks.module';

@Module({
  imports: [TransactionsModule, BanksModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
