import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CommissionModule } from "./commission/commission.module";
import { ClientModule } from "./client/client.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RulesModule } from "./rules/rules.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommissionModule,
    ClientModule,
    PrismaModule,
    RulesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
