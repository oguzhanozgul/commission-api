import { Test, TestingModule } from "@nestjs/testing";
import { CommissionDto } from "../../../commission/dto";
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

  describe("Get commission amount", () => {
    let client_id_regular: number;
    let client_id_special: number;
    let client_id_highvolume: number;
    describe("Create clients, transactions, special conditions", () => {
      it("should create clients", async () => {
        let client = await prisma.clients.create({
          data: {
            client_name: "Acme Inc.",
          },
        });
        client_id_regular = client.id;
        client = await prisma.clients.create({
          data: {
            client_name: "Special Inc.",
          },
        });
        client_id_special = client.id;
        client = await prisma.clients.create({
          data: {
            client_name: "HighVolume Inc.",
          },
        });
        client_id_highvolume = client.id;
      });
      it("should create transaction for high volume client", async () => {
        const transaction_HighVolume = await prisma.transactions.create({
          data: {
            client_id: client_id_highvolume,
            transaction_date: new Date("2021-10-23"),
            transaction_amount: 600,
            transaction_currency: "BAR",
            commission_amount: 6,
            commission_currency: "EUR",
            exchange_rate: 2,
            transaction_amount_in_eur: 1200,
          },
        });
      });
      it("should create client special condition", async () => {
        const clientCondition_Special =
          await prisma.clients_with_special_commission.create({
            data: {
              client_id: client_id_special,
              commission_amount: 0.05,
              is_active: true,
            },
          });
      });
    });

    describe("Calculate and return commission responses", () => {
      it("should return correct regular commission", async () => {
        const commissionDto_regular: CommissionDto = {
          client_id: client_id_regular,
          date: "2021-10-23",
          amount: 500,
          currency: "EUR",
        };
        const commissionResponse = await service.calculateCommission(
          commissionDto_regular,
        );
        expect(commissionResponse.amount).toBe("2.5");
        expect(commissionResponse.currency).toBe("EUR");
      });
      it("should return correct special commission", async () => {
        const commissionDto_special: CommissionDto = {
          client_id: client_id_special,
          date: "2021-10-23",
          amount: 500,
          currency: "EUR",
        };
        const commissionResponse = await service.calculateCommission(
          commissionDto_special,
        );
        expect(commissionResponse.amount).toBe("0.05");
        expect(commissionResponse.currency).toBe("EUR");
      });
      it("should return correct high volume commission", async () => {
        const commissionDto_highvolume: CommissionDto = {
          client_id: client_id_highvolume,
          date: "2021-10-23",
          amount: 500,
          currency: "EUR",
        };
        const commissionResponse = await service.calculateCommission(
          commissionDto_highvolume,
        );
        expect(commissionResponse.amount).toBe("0.03");
        expect(commissionResponse.currency).toBe("EUR");
      });
      it("should return correct regular commission for non-EUR currency", async () => {
        const commissionDto_regular: CommissionDto = {
          client_id: client_id_regular,
          date: "2021-10-23",
          amount: 500,
          currency: "PLN",
        };
        const commissionResponse = await service.calculateCommission(
          commissionDto_regular,
        );
        expect(commissionResponse.amount).toBe("0.54");
        expect(commissionResponse.currency).toBe("EUR");
      });
    });
  });
});
