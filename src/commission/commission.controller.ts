import { Body, Controller, Get } from "@nestjs/common";
import { CommissionService } from "./commission.service";
import { CommissionDto } from "./dto";

@Controller("commission")
export class CommissionController {
  constructor(private commService: CommissionService) {}

  // end point to get the calculated commission amount
  @Get("amount")
  calculateCommission(@Body() commissionDto: CommissionDto) {
    return this.commService.calculateCommission(commissionDto);
  }
}
