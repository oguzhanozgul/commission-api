/* eslint-disable @typescript-eslint/ban-types */
import { IsNotEmpty } from "class-validator";
import { CommissionDto } from "src/commission/dto";

export class RuleInputDto {
  @IsNotEmpty()
  commissionDto: CommissionDto;

  @IsNotEmpty()
  transactionAmountInEUR: number;

  @IsNotEmpty()
  clientBestSpecial;

  @IsNotEmpty()
  clientMonthlyTotal;

  @IsNotEmpty()
  regularCommissionPercentage: {
    nominator: number;
    denominator: number;
  };
}
