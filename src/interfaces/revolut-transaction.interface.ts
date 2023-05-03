export interface RevolutTransaction {
  id: string;
  created_at: string;
  completed_at: string;
  state: string;
  amount: TransactionAmount;
  merchant: null;
  counterparty: CounterParty;
  reference: string;
}

interface TransactionAmount {
  currency: string;
  value: string;
}

interface CounterParty {
  id: string;
  name: string;
}