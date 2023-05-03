import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BanksService } from './banks.service';

@Module({
  imports: [HttpModule],
  providers: [BanksService],
  exports: [BanksService],
})
export class BanksModule {}
