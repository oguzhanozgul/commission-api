import currency from "currency.js";
import { ClientDto } from "../client/dto/";
import { CommissionDto } from "../commission/dto/";

export class FakeDB {
  // Fake clients:

  clientArray = [
    { id: 9, client_name: "Acme Inc" },
    { id: 42, client_name: "Special Client LLC" },
    { id: 51, client_name: "High Volume Client LLC" },
  ];
  aClient = this.clientArray[0];
  testClientID = this.clientArray[0].id;
  testClientName = this.clientArray[0].client_name;
  aClientDto: ClientDto = { client_id: this.testClientID };

  transactionsArray = [
    {
      id: 235,
      client_id: 9,
      transaction_date: "2021-10-22T00:00:00.000Z",
      transaction_amount: "3000",
      transaction_currency: "BBD",
      commission_amount: "0.05",
      commission_currency: "EUR",
      exchange_rate: "2.204495",
      transaction_amount_in_eur: "1360.86",
    },
    {
      id: 236,
      client_id: 9,
      transaction_date: "2021-10-23T00:00:00.000Z",
      transaction_amount: "9000",
      transaction_currency: "ZMW",
      commission_amount: "0.03",
      commission_currency: "EUR",
      exchange_rate: "19.428104",
      transaction_amount_in_eur: "463.25",
    },
    {
      id: 281,
      client_id: 9,
      transaction_date: "2021-11-12T00:00:00.000Z",
      transaction_amount: "13230",
      transaction_currency: "AFN",
      commission_amount: "0.05",
      commission_currency: "EUR",
      exchange_rate: "96.442519",
      transaction_amount_in_eur: "137.19",
    },
  ];
  aTransaction = this.transactionsArray[0];
  testClientLifetimeTotalTransactions = 1961.3; // client ID 9
  testClientMonthlyTotalTransactions = 1824.11; // client ID 9, date 2021-10

  // commission request regular client
  clientRegular_CommDto: CommissionDto = {
    client_id: 9,
    date: "2021-10-23",
    amount: 500,
    currency: "EUR",
  };
  clientRegular_SpecialCommissionResponse = {
    client_id: 9,
    min_special_commission: null,
    min_special_commission_currency: "EUR",
  };
  clientRegular_MonthlyTotalResponse = {
    client_id: 9,
    date: parseFloat(new Date("2021-10-01").toString()),
    amount: "100.00",
    currency: "EUR",
  };
  clientRegular_CommissionResponse = {
    amount: "2.5",
    currency: "EUR",
  };

  // commission request special client
  clientSpecial_CommDto: CommissionDto = {
    client_id: 42,
    date: "2021-10-23",
    amount: 500,
    currency: "EUR",
  };
  clientSpecial_SpecialCommissionResponse = {
    client_id: 42,
    min_special_commission: 0.02,
    min_special_commission_currency: "EUR",
  };
  clientSpecial_MonthlyTotalResponse = {
    client_id: 42,
    date: parseFloat(new Date("2021-10-01").toString()),
    amount: "100.00",
    currency: "EUR",
  };
  clientSpecial_CommissionResponse = {
    amount: "0.02",
    currency: "EUR",
  };

  // commission request high volume client
  clientHighVolume_CommDto: CommissionDto = {
    client_id: 51,
    date: "2021-10-23",
    amount: 500,
    currency: "EUR",
  };
  clientHighVolume_SpecialCommissionResponse = {
    client_id: 51,
    min_special_commission: null,
    min_special_commission_currency: "EUR",
  };
  clientHighVolume_MonthlyTotalResponse = {
    client_id: 51,
    date: parseFloat(new Date("2021-10-01").toString()),
    amount: "1200.00",
    currency: "EUR",
  };
  clientHighVolume_CommissionResponse = {
    amount: "0.03",
    currency: "EUR",
  };

  // commission request regular client non-EUR
  clientRegularNonEUR_CommDto: CommissionDto = {
    client_id: 50,
    date: "2021-10-23",
    amount: 7500,
    currency: "TRY",
  };
  clientRegularNonEUR_SpecialCommissionResponse = {
    client_id: 50,
    min_special_commission: null,
    min_special_commission_currency: "EUR",
  };
  clientRegularNonEUR_MonthlyTotalResponse = {
    client_id: 50,
    date: parseFloat(new Date("2021-10-01").toString()),
    amount: "100.00",
    currency: "EUR",
  };
  clientRegularNonEUR_CommissionResponse = {
    amount: "2.5",
    currency: "EUR",
  };
  clientRegularNonEUR_TransactionAmountEUR = 500;
}
