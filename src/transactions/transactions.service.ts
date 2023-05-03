import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

import { BanksService } from '../banks/banks.service';
import { MonzoTransaction, RevolutTransaction, StarlingTransaction } from '../interfaces/';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsResponseDto } from './dto/transactions-response.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly banksService: BanksService,
  ) {}

  public async getTransactions(bankName?: string): Promise<TransactionsResponseDto> {
    try {
      if (!bankName) {
        const transactions = await this.banksService.getAllBanksTransactions();
        const data = Object.entries(transactions).reduce((acc, [bankName, bankTransactions]) => {
          return acc.concat([...bankTransactions.map((item) => this.mappers[bankName](item))]);
        }, [] as TransactionDto[]);
  
        return { transactions: data }
      }
      const transactions = await this.banksService.getBankTransactions(bankName);
  
      return {
        transactions: transactions.map((item) => this.mappers[bankName](item)),
      };
    } catch (error) {
      if (error.status === 400) {
        throw new ServiceUnavailableException('Bank API unavailable');
      }
      throw new BadRequestException(error);
    }
  }

  private mappers = {
    monzo: (transaction: MonzoTransaction): TransactionDto => ({
      id: transaction.id,
      created: transaction.created,
      description: transaction.description,
      amount: {
        value: transaction.amount.toString(),
        currency: transaction.currency,
      },
      type: this.getTransactionType(transaction.amount),
      reference: transaction.metadata.reference,
      metadata: {
        source: 'Monzo'
      }
    }),
    revolut: (transaction: RevolutTransaction): TransactionDto => ({
      id: transaction.id,
      created: transaction.created_at,
      description: '',
      amount: transaction.amount,
      type: this.getTransactionType(transaction.amount.value),
      reference: transaction.reference,
      metadata: { source: 'Revolut' },
    }),
    sterling_bank: (transaction: StarlingTransaction): TransactionDto => ({
      id: transaction.id,
      created: transaction.created,
      description: '',
      amount: { value: transaction.amount, currency: transaction.currency },
      type: this.getTransactionType(transaction.amount),
      reference: transaction.reference,
      metadata: { source: 'Sterling Bank' },
    })
  }

  private getTransactionType = (amount: number | string): string => parseFloat(amount as never) < 0 ? 'DEBIT' : 'CREDIT';
}
