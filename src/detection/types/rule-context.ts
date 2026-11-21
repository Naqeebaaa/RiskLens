//RuleContext — rule ko kya input milega.

import type { Transaction } from "../../schemas/transaction.schema.js";

export interface RuleContext {
  accountId: string;
  transaction: Transaction;

  // Previous outgoing transfers from the monitored account
  //	Structuring + Rapid Pass-through
  previousOutgoingTransactions: Transaction[];

  // Previous incoming transactions to the monitored account
  //Rapid Pass-through
  previousIncomingTransactions: Transaction[];

  // Previous cash deposits into the monitored account
  //	Smurfing
  previousCashDeposits: Transaction[];

  // Complete previous account activity (incoming + outgoing)
  //	Dormant Account
  previousAccountActivity: Transaction[];
}

//Note: Rapid Pass-through ke liye incoming history mein TRANSFER aur CASH_DEPOSIT dono hone chahiye.
//Ek important detail: previousCashDeposits technically previousIncomingTransactions ka subset hai. Hum dono separately rakhenge taa-ke Smurfing ko precise input mile.