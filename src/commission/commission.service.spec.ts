import { Test, TestingModule } from "@nestjs/testing";
import { CommissionService } from "./commission.service";
import { PrismaService } from "../prisma/prisma.service";
import { FakeDB } from "../utils/FakeDB";
import { ClientService } from "../client/client.service";

const fakeDB = new FakeDB();

const db = {
  clients: {
    findMany: jest.fn().mockResolvedValue(fakeDB.clientArray),
    findUnique: jest.fn().mockResolvedValue(fakeDB.aClient),
    create: jest.fn().mockReturnValue(fakeDB.aClient),
  },
  transactions: {
    findMany: jest.fn().mockResolvedValue(fakeDB.transactionsArray),
    create: jest.fn().mockReturnValue(fakeDB.aTransaction),
  },
  // clients_with_special_commission: {
  //   findMany: jest.fn().mockResolvedValue(fakeDB.specialCommissionsArray),
  // },
};

const cs = {
  clientBestSpecial: jest
    .fn()
    .mockResolvedValueOnce(fakeDB.clientRegular_SpecialCommissionResponse)
    .mockResolvedValueOnce(fakeDB.clientSpecial_SpecialCommissionResponse)
    .mockResolvedValueOnce(fakeDB.clientHighVolume_SpecialCommissionResponse),
  clientMonthlyTotal: jest
    .fn()
    .mockResolvedValueOnce(fakeDB.clientRegular_MonthlyTotalResponse)
    .mockResolvedValueOnce(fakeDB.clientSpecial_MonthlyTotalResponse)
    .mockResolvedValueOnce(fakeDB.clientHighVolume_MonthlyTotalResponse),
};

describe("CommissionService", () => {
  let service: CommissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: ClientService,
          useValue: cs,
        },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  describe("Get commission amount", () => {
    it("should get correct commission amount for regular customer", () => {
      expect(
        service.calculateCommission(fakeDB.clientRegular_CommDto),
      ).resolves.toEqual(fakeDB.clientRegular_CommissionResponse);
    });
    it("should get correct commission amount for special customer", () => {
      expect(
        service.calculateCommission(fakeDB.clientSpecial_CommDto),
      ).resolves.toEqual(fakeDB.clientSpecial_CommissionResponse);
    });
    it("should get correct commission amount for high volume customer", () => {
      expect(
        service.calculateCommission(fakeDB.clientHighVolume_CommDto),
      ).resolves.toEqual(fakeDB.clientHighVolume_CommissionResponse);
    });
  });
});
