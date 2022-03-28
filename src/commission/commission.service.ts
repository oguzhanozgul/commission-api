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

  applyRule1(ruleInput) {
    let result = Infinity;
    // calculate regular commission
    result = currency(ruleInput.transactionAmountInEUR)
      .multiply(ruleInput.regularCommissionPercentage.nominator)
      .divide(ruleInput.regularCommissionPercentage.denominator).value;
    // check if result is less than 0.05EUR and raise it if so
    if (result < 0.05) {
      result = 0.05;
    }
    return result;
  }

  applyRule2(ruleInput) {
    let result = Infinity;
    if (ruleInput.clientBestSpecial?.min_special_commission) {
      result = ruleInput.clientBestSpecial.min_special_commission;
    }
    return result;
  }

  applyRule3(ruleInput) {
    let result = Infinity;
    if (ruleInput.clientMonthlyTotal) {
      const amount = parseFloat(ruleInput.clientMonthlyTotal.amount as string);
      if (amount > 1000) {
        result = 0.03;
      }
    }
    return result;
  }

  async calculateCommission(commissionDto: CommissionDto) {
    let exchangeRate = 1;
    let transactionAmountInEUR = null;
    let finalCommissionAmount = 0;

    // prepare input for rules
    // get the best discounted commission amount for the client
    const clientBestSpecial = await this.clientService.clientBestSpecial({
      client_id: commissionDto.client_id,
    });
    // get the monthly total transaction amount for the client
    const clientMonthlyTotal = await this.clientService.clientMonthlyTotal({
      client_id: commissionDto.client_id,
      date: commissionDto.date,
    });
    // get the transaction amount in EUR using the conversion API
    if (commissionDto.currency === "EUR") {
      transactionAmountInEUR = commissionDto.amount;
    } else {
      const exchangedAmount = await this.getExchangedAmount(commissionDto);
      transactionAmountInEUR = exchangedAmount.amount;
      exchangeRate = exchangedAmount.fx_rate;
    }
    // construct ruleInput
    const ruleInput = {
      commissionDto: commissionDto,
      transactionAmountInEUR: transactionAmountInEUR,
      clientBestSpecial: clientBestSpecial,
      clientMonthlyTotal: clientMonthlyTotal,
      regularCommissionPercentage: { nominator: 5, denominator: 1000 },
    };

    // compare commissions and set the lowest one as the final commission
    finalCommissionAmount = Math.min(
      this.applyRule1(ruleInput),
      this.applyRule2(ruleInput),
      this.applyRule3(ruleInput),
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
