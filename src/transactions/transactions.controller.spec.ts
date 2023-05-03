import { Test, TestingModule } from '@nestjs/testing';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { BanksService } from '../banks/banks.service';
import { BankNameEnum } from '../enums';

describe('TransactionsController', () => {
  let service: TransactionsService;
  let controller: TransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [TransactionsService, {
        provide: BanksService,
        useValue: {
          getBankTransactions: jest.fn(),
          getAllBanksTransactions: jest.fn(),
        }
      }],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('root', () => {
    it('should return transactions array', async () => {
      jest.spyOn(service, 'getTransactions')
        .mockResolvedValueOnce({ transactions: [] });
      const result = await controller.getTransactions({ source: BankNameEnum.revolut });

      expect(result).toMatchObject({ transactions: [] });
    });
  });
});
