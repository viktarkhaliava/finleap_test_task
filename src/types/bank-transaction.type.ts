import { MonzoTransaction, RevolutTransaction, StarlingTransaction } from "src/interfaces";

export type BankTransaction = MonzoTransaction | RevolutTransaction | StarlingTransaction;