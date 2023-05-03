import { IsEnum, IsOptional } from 'class-validator';
import { BankNameEnum } from '../../enums';

export class TransactionsQueryDto {
  @IsEnum(BankNameEnum)
  @IsOptional()
  source: string;
}