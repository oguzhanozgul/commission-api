import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty } from "class-validator";

export class ClientDateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  client_id: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}
