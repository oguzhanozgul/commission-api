import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get("DATABASE_URL"),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanTestDB() {
    if (process.env.NODE_ENV === "production") return;
    if (process.env.INT_TESTING === "true") {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== "_");
      // do cleanup below
      // return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
    }
  }
}
