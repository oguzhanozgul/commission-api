import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CommissionModule } from "./commission/commission.module";
import { ClientModule } from "./client/client.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommissionModule,
    ClientModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
