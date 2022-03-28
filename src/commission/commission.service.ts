import { Injectable } from "@nestjs/common";
import * as currency from "currency.js";
import { ClientService } from "../client/client.service";
import { PrismaService } from "../prisma/prisma.service";
import { CommissionDto } from "./dto";
import axios from "axios";

@Injectable()
export class CommissionService {
  constructor(
    private prismaService: PrismaService,
    private clientService: ClientService,
  ) {}

  async calculateCommission(commissionDto: CommissionDto) {
    let exchangeRate = 1;
    let transactionAmountInEUR = null;
    let specialCommissionAmount = Infinity;
    let highVolumeCommissionAmount = Infinity;
    let regularCommissionAmount = Infinity;
    let finalCommissionAmount = 0;

    // calculate regular commission
    // first check if the currency is EUR and exchange if needed
    if (commissionDto.currency === "EUR") {
      regularCommissionAmount = currency(commissionDto.amount)
        .multiply(5)
        .divide(1000).value;
      transactionAmountInEUR = commissionDto.amount;
    } else {
      // get exchanged amount from the currency conversion API
      const exchangedAmount = await this.getExchangedAmount(commissionDto);
      regularCommissionAmount = currency(exchangedAmount.amount)
        .multiply(5)
        .divide(1000).value;
      transactionAmountInEUR = exchangedAmount.amount;
      exchangeRate = exchangedAmount.fx_rate;
    }
    // finally check if regularCommissionAmount is less than 0.05EUR and raise it if so
    if (regularCommissionAmount < 0.05) {
      regularCommissionAmount = 0.05;
    }

    // check if the client has a defined and active special commission amount, if more than one, take the minimum
    const specialCommissionMinimum = await this.clientService.clientBestSpecial(
      { client_id: commissionDto.client_id },
    );
    if (specialCommissionMinimum?.min_special_commission) {
      specialCommissionAmount = specialCommissionMinimum.min_special_commission;
    }

    // check if previous monthly total is already above 1000.00 EUR
    const monthlyTransactions = await this.clientService.clientMonthlyTotal({
      client_id: commissionDto.client_id,
      date: commissionDto.date,
    });
    parseFloat(monthlyTransactions.amount as string);
    if (monthlyTransactions) {
      if (parseFloat(monthlyTransactions.amount as string) > 1000) {
        highVolumeCommissionAmount = 0.03;
      }
    }

    // compare commissions and set the lowest one as the final commission
    finalCommissionAmount = Math.min(
      regularCommissionAmount,
      highVolumeCommissionAmount,
      specialCommissionAmount,
    );

    // insert new transaction to the database
    const transaction = await this.addTransactionToDB(
      commissionDto,
      finalCommissionAmount,
      exchangeRate,
      transactionAmountInEUR,
    );

    // send back the response
    return {
      amount: currency(finalCommissionAmount).value.toString(),
      currency: "EUR",
    };
  }

  async addTransactionToDB(
    commissionDto,
    commissionAmount,
    exchangeRate,
    transactionAmountInEUR,
  ) {
    try {
      const transaction = await this.prismaService.transactions.create({
        data: {
          client_id: commissionDto.client_id,
          transaction_date: new Date(commissionDto.date),
          transaction_amount: commissionDto.amount,
          transaction_currency: commissionDto.currency,
          commission_amount: commissionAmount,
          commission_currency: "EUR",
          exchange_rate: exchangeRate,
          transaction_amount_in_eur: transactionAmountInEUR,
        },
      });
      // return the saved transaction
      return transaction;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getExchangedAmount(commissionDto) {
    const params = new URLSearchParams({
      from: commissionDto.currency,
      to: "EUR",
      amount: commissionDto.amount,
      date: new Date(commissionDto.date).toISOString().split("T")[0],
      places: "6",
    });
    try {
      const response = await axios.get(
        `https://api.exchangerate.host/convert`,
        {
          params,
        },
      );
      return {
        amount: this.round(response.data.result, 2),
        fx_rate: response.data.info.rate,
      };
    } catch (error) {
      return {
        amount: null,
        fx_rate: null,
      };
    }
  }

  round(value, decimals) {
    return Number(
      Math.round((value + "e" + decimals) as unknown as number) +
        "e-" +
        decimals,
    );
  }
}
