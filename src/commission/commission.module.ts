import { Module } from "@nestjs/common";
import { ClientModule } from "../client/client.module";
import { CommissionController } from "./commission.controller";
import { CommissionService } from "./commission.service";

@Module({
  imports: [ClientModule],
  controllers: [CommissionController],
  providers: [CommissionService],
})
export class CommissionModule {}
