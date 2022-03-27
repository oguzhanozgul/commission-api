import { Type } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class ClientDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  client_id: number;
}
