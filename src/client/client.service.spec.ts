import { Test, TestingModule } from "@nestjs/testing";
import { ClientService } from "./client.service";
import { PrismaService } from "../prisma/prisma.service";
import { FakeDB } from "../utils/FakeDB";

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
};

describe("ClientService", () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Get client details", () => {
    it("should get client details for one client", () => {
      expect(service.clientDetails(fakeDB.aClientDto)).resolves.toEqual(
        fakeDB.aClient,
      );
    });
  });

  describe("Get client transactions", () => {
    it("should get lifetime transactions for one client", () => {
      expect(service.clientTransactions(fakeDB.aClientDto)).resolves.toEqual(
        fakeDB.transactionsArray,
      );
    });
  });
});
