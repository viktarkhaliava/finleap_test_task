import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BankNameEnum } from '../enums';
import { TransactionsService } from './transactions.service';
import { TransactionsQueryDto } from './dto/transactions-query.dto';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('')
  @ApiQuery({ name: 'source', enum: BankNameEnum, required: false })
  public async getTransactions(@Query() transactionsQueryDto: TransactionsQueryDto): Promise<any> {
    return this.transactionsService.getTransactions(transactionsQueryDto.source);
  }
}
