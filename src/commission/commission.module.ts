import { Module } from "@nestjs/common";
import { RulesModule } from "../rules/rules.module";
import { ClientModule } from "../client/client.module";
import { CommissionController } from "./commission.controller";
import { CommissionService } from "./commission.service";

@Module({
  imports: [ClientModule, RulesModule],
  controllers: [CommissionController],
  providers: [CommissionService],
})
export class CommissionModule {}
