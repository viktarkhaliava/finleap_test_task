import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { TransactionDto } from "./transaction.dto";

describe('TransactionDto', () => {
  let transactionDto: TransactionDto;

  it('should validate properties', async () => {
    transactionDto = {
      "id": "tr_0987654321",
      "created": "2022-03-21T14:16:32.000Z",
      "description": "",
      "amount": {
        "value": "78.99",
        "currency": "EUR"
      },
      "type": "CREDIT",
      "reference": "SEPA-0987654321",
      "metadata": {
        "source": "Revolut"
      }
    };
    transactionDto.type = false as unknown as string;
    const instance = plainToInstance(TransactionDto, transactionDto);
    const result = await validate(instance);
    
    expect(result[0].property).toBe('type');
  })
})