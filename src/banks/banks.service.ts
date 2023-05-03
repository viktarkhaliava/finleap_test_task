import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as nock from 'nock';
import { firstValueFrom } from 'rxjs';

import * as jsonData from '../mocks';
import { BankNameEnum } from '../enums';
import { BankTransaction } from '../types/bank-transaction.type';

@Injectable()
export class BanksService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) { }

  public async getBankTransactions(bankName: string): Promise<BankTransaction[]> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const bankApi = this.configService.get<string>('BANK_API');
    
    if (nodeEnv === 'dev') {
      this.mockRequest(bankName);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<BankTransaction[]>(`${bankApi}/api/${bankName}`)
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(error.response.statusText);
    }
  }

  public async getAllBanksTransactions(): Promise<{ [key: string]: BankTransaction[] }> {
    const banksArray = Object.keys(BankNameEnum);
    const banksTransactions = banksArray.map((bankName: string) => this.getBankTransactions(bankName));
    const transactions = await Promise.all(banksTransactions);

    return banksArray.reduce((acc, bankName, index) => {
      acc[bankName] = transactions[index];
      return acc;
    }, {});
  }

  private mockRequest(bankName: string): void {
    const bankApi = this.configService.get<string>('BANK_API');

    nock(bankApi)
      .get(`/api/${bankName}`)
      .reply(200, jsonData[bankName]);
  }
}
