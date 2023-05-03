import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

import { BanksService } from './banks.service';
import { BankNameEnum } from '../enums';
import { BankTransaction } from '../types/bank-transaction.type';
import * as jsonData from '../mocks';

const mockedSterlingBankResponse: any = {
  data: [jsonData.sterling_bank[0]],
  headers: {},
  config: { url: `https://banksapi.com/api/${BankNameEnum.sterling_bank}` },
  status: 200,
  statusText: 'OK',
};

const mockedMonzoResponse: any = {
  data: [jsonData.monzo[0]],
  headers: {},
  config: { url: `https://banksapi.com/api/${BankNameEnum.monzo}` },
  status: 200,
  statusText: 'OK',
};

const mockedRevolutResponse: any = {
  data: [jsonData.revolut[0]],
  headers: {},
  config: { url: `https://banksapi.com/api/${BankNameEnum.revolut}` },
  status: 200,
  statusText: 'OK',
};

describe('BanksService', () => {
  let service: BanksService;
  let httpService: HttpService;

  const err: AxiosError = {
    config: { headers: {} as any },
    code: '500',
    name: '',
    message: '',
    response: {
      data: {},
      status: 500,
      statusText: '',
      headers: {},
      config: { headers: {} as any }
    },
    isAxiosError: true,
    toJSON: () => null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanksService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') {
                return 'dev';
              } else if (key === 'BANK_API') {
                return 'https://banksapi.com';
              }
              return '';
            }),
          }
        }
      ],
    }).compile();

    service = module.get<BanksService>(BanksService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBankTransactions', () => {
    it('should return correct response if request return data', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockedSterlingBankResponse));
  
      const response: AxiosResponse<BankTransaction[]> = {
        data: [
          {
            "id": "6d4c34fc-94e7-4e52-8a36-9c40b102ecfc",
            "currency": "EUR",
            "amount": "-25.00",
            "direction": "OUT",
            "narrative": "Payment to Jane Smith",
            "created": "2022-03-21T14:16:32.000Z",
            "reference": "SEPA-1234567890"
          }
        ],
        headers: {},
        config: { url: `https://banksapi.com/api/${BankNameEnum.sterling_bank}`, headers: {} as any },
        status: 200,
        statusText: 'OK',
      };
  
      const result = await service.getBankTransactions(BankNameEnum.sterling_bank);
      expect(result).toEqual(response.data);
    });
  
    it('should return 400 exception if request failed', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(Promise.reject(err) as never));
  
      try {
        await service.getBankTransactions(BankNameEnum.sterling_bank);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('getAllBanksTransactions', () => {
    it('should return correct responses for all banks if requests return correct data', async () => {
      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(of(mockedRevolutResponse))
        .mockReturnValueOnce(of(mockedSterlingBankResponse))
        .mockReturnValueOnce(of(mockedMonzoResponse));
  
      const result = await service.getAllBanksTransactions();
      expect(result).toEqual({
        revolut: [jsonData.revolut[0]],
        sterling_bank: [jsonData.sterling_bank[0]],
        monzo: [jsonData.monzo[0]],
      });
    });
  
    it('should return 400 exception if request failed', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(Promise.reject(err) as never));
  
      try {
        await service.getAllBanksTransactions();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
