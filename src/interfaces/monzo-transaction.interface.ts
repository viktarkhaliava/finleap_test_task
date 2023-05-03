export interface MonzoTransaction {
  id: string;
  created: string;
  description: string;
  amount: number;
  currency: string;
  metadata: Metadata;
}

interface Metadata {
  reference: string;
}
