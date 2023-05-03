import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { BanksService } from '../banks/banks.service';
import { BankNameEnum } from '../enums';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let banksService: BanksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: BanksService,
          useValue: {
            getBankTransactions: jest.fn(),
            getAllBanksTransactions: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    banksService = module.get<BanksService>(BanksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return mapped array of transactions for a specific bank', async () => {
      const spy = jest.spyOn(banksService, 'getBankTransactions')
        .mockResolvedValueOnce(
          [{
            "id": "tr_0987654321",
            "created_at": "2022-03-21T14:16:32.000Z",
            "completed_at": "2022-03-21T14:18:32.000Z",
            "state": "COMPLETED",
            "amount": {
              "value": "78.99",
              "currency": "EUR"
            },
            "merchant": null,
            "counterparty": {
              "id": "acc_0987654321",
              "name": "John Doe"
            },
            "reference": "SEPA-0987654321"
          }]
        );

      const result = await service.getTransactions(BankNameEnum.revolut);
      expect(result).toMatchObject({
        transactions: [
          {
            id: 'tr_0987654321',
            created: '2022-03-21T14:16:32.000Z',
            description: '',
            amount: {
              currency: 'EUR',
              value: "78.99",
            },
            type: 'CREDIT',
            reference: 'SEPA-0987654321',
            metadata: {
              source: "Revolut",
            }
          }
        ]
      });

      expect(spy).toHaveBeenCalledWith(BankNameEnum.revolut);
    });

    it('should return mapped array of transactions for all banks if bankName parameter is not provided', async () => {
      const spy = jest.spyOn(banksService, 'getAllBanksTransactions')
        .mockResolvedValueOnce({
          [BankNameEnum.revolut]: [{
            "id": "tr_0987654321",
            "created_at": "2022-03-21T14:16:32.000Z",
            "completed_at": "2022-03-21T14:18:32.000Z",
            "state": "COMPLETED",
            "amount": {
              "value": "78.99",
              "currency": "EUR"
            },
            "merchant": null,
            "counterparty": {
              "id": "acc_0987654321",
              "name": "John Doe"
            },
            "reference": "SEPA-0987654321"
          }],
          [BankNameEnum.monzo]: [{
            "id": "tx_00001YpBqNqL8mWnKf4t2Z",
            "created": "2023-04-05T09:12:00.000Z",
            "description": "Monthly rent payment",
            "amount": -120000,
            "currency": "EUR",
            "metadata": {
              "reference": "SEPA-0987654321"
            }
          }],
          [BankNameEnum.sterling_bank]: [{
            "id": "6d4c34fc-94e7-4e52-8a36-9c40b102ecfc",
            "currency": "EUR",
            "amount": "-25.00",
            "direction": "OUT",
            "narrative": "Payment to Jane Smith",
            "created": "2022-03-21T14:16:32.000Z",
            "reference": "SEPA-1234567890"
          }]
        });
      const result = await service.getTransactions();

      expect(spy).toHaveBeenCalledWith();      
      expect(result).toMatchObject({
        transactions: [
          {
            id: 'tr_0987654321',
            created: '2022-03-21T14:16:32.000Z',
            description: '',
            amount: { value: '78.99', currency: 'EUR' },
            type: 'CREDIT',
            reference: 'SEPA-0987654321',
            metadata: { source: 'Revolut' }
          },
          {
            id: 'tx_00001YpBqNqL8mWnKf4t2Z',
            created: '2023-04-05T09:12:00.000Z',
            description: 'Monthly rent payment',
            amount: { value: '-120000', currency: 'EUR' },
            type: 'DEBIT',
            reference: 'SEPA-0987654321',
            metadata: { source: 'Monzo' }
          },
          {
            id: '6d4c34fc-94e7-4e52-8a36-9c40b102ecfc',
            created: '2022-03-21T14:16:32.000Z',
            description: '',
            amount: { value: '-25.00', currency: 'EUR' },
            type: 'DEBIT',
            reference: 'SEPA-1234567890',
            metadata: { source: 'Sterling Bank' }
          }
        ]
      });
    });

    it('should throw 503 exception if bank API failed request', async () => {
      jest.spyOn(banksService, 'getAllBanksTransactions')
        .mockRejectedValueOnce(new BadRequestException('Bad Requests'))
      try {
        await service.getTransactions();
      } catch (error) {
        expect(error.status).toBe(503);
      }
    });

    it('should throw 400 exception on error', async () => {
      jest.spyOn(banksService, 'getAllBanksTransactions')
        .mockRejectedValueOnce(new Error('error'))
      try {
        await service.getTransactions();
      } catch (error) {
        expect(error.status).toBe(400);
      }
    });
  });
});
