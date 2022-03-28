import { Injectable } from "@nestjs/common";
import * as currency from "currency.js";
import { RuleInputDto } from "../rules/dto";

@Injectable()
export class RulesService {
  // eslint-disable-next-line @typescript-eslint/ban-types
  rules: Function[];
  constructor() {
    this.rules = this.defineRules();
  }

  defineRules() {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const rules: Function[] = [];
    // Define rules here. All rules should take ruleInput as a parameter

    //
    // RULE 1:
    // Return 0.5% of transaction value with a minimum of 0.05 EUR
    //
    rules.push((ruleInput: RuleInputDto) => {
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
    });

    //
    // RULE 2:
    // Return minimum special commission amount if the client has
    // at least one defined.
    //
    rules.push((ruleInput: RuleInputDto) => {
      const result: number =
        ruleInput.clientBestSpecial.min_special_commission ?? Infinity;
      return result;
    });

    //
    // RULE 3:
    // Return special commission amount if the customer has high
    // volume within the transaction month
    //
    rules.push((ruleInput: RuleInputDto) => {
      let result = Infinity;
      if (parseFloat(ruleInput.clientMonthlyTotal.amount as string) > 1000) {
        result = 0.03;
      }
      return result;
    });

    return rules;
  }

  getMinimumCommission(ruleInput: RuleInputDto): number {
    let minCommissionAmount: number = null;
    const commissionAmounts: number[] = [];
    this.rules.forEach((singleRule) =>
      commissionAmounts.push(singleRule(ruleInput)),
    );
    minCommissionAmount = Math.min(...commissionAmounts);
    return minCommissionAmount;
  }
}
