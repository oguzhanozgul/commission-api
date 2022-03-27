import { Decimal } from "@prisma/client/runtime";
import { Type } from "class-transformer";
import {
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";

export class CommissionDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: number;

  @IsNotEmpty()
  @Type(() => Decimal)
  @IsDecimal()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  client_id: number;
}
