import { Type } from "class-transformer";
import { IsDate, IsInt, IsNotEmpty } from "class-validator";

export class ClientDateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  client_id: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: number;
}
