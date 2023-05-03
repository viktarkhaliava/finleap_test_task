import { IsDateString, IsNumberString, IsObject, IsString } from "class-validator";

class TransactionAmountDto {
  @IsString()
  currency: string;

  @IsNumberString()
  value: string;
}

class TransactionMetadataDto {
  @IsString()
  source: string;
}

export class TransactionDto {
  @IsString()
  id: string;

  @IsDateString()
  created: string;

  @IsString()
  description: string;

  @IsObject()
  amount: TransactionAmountDto;

  @IsString()
  type: string;

  @IsString()
  reference: string;

  @IsObject()
  metadata: TransactionMetadataDto;
}
