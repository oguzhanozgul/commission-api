import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../app.module";
import { CommissionService } from "../../../commission/commission.service";
import { PrismaService } from "../../../prisma/prisma.service";

describe("CommissionService Integration", () => {
  let service: CommissionService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(CommissionService);
    await prisma.cleanTestDB();
  });
  it.todo("should pass");
});
