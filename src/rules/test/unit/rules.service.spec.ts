import { Test, TestingModule } from "@nestjs/testing";
import { RulesService } from "../../rules.service";
import { RuleInputDto } from "../../../rules/dto";
import { FakeDB } from "../../../utils/FakeDB";

const fakeDB = new FakeDB();

const ruleInput_Regular: RuleInputDto = {
  commissionDto: fakeDB.clientRegular_CommDto,
  transactionAmountInEUR: fakeDB.clientRegular_CommDto.amount,
  clientBestSpecial: fakeDB.clientRegular_SpecialCommissionResponse,
  clientMonthlyTotal: fakeDB.clientRegular_MonthlyTotalResponse,
  regularCommissionPercentage: { nominator: 5, denominator: 1000 },
};
const ruleInput_Special: RuleInputDto = {
  commissionDto: fakeDB.clientSpecial_CommDto,
  transactionAmountInEUR: fakeDB.clientSpecial_CommDto.amount,
  clientBestSpecial: fakeDB.clientSpecial_SpecialCommissionResponse,
  clientMonthlyTotal: fakeDB.clientSpecial_MonthlyTotalResponse,
  regularCommissionPercentage: { nominator: 5, denominator: 1000 },
};
const ruleInput_HighVolume: RuleInputDto = {
  commissionDto: fakeDB.clientHighVolume_CommDto,
  transactionAmountInEUR: fakeDB.clientHighVolume_CommDto.amount,
  clientBestSpecial: fakeDB.clientHighVolume_SpecialCommissionResponse,
  clientMonthlyTotal: fakeDB.clientHighVolume_MonthlyTotalResponse,
  regularCommissionPercentage: { nominator: 5, denominator: 1000 },
};
const ruleInput_RegularNonEUR: RuleInputDto = {
  commissionDto: fakeDB.clientRegularNonEUR_CommDto,
  transactionAmountInEUR: fakeDB.clientRegularNonEUR_TransactionAmountEUR,
  clientBestSpecial: fakeDB.clientRegularNonEUR_SpecialCommissionResponse,
  clientMonthlyTotal: fakeDB.clientRegularNonEUR_MonthlyTotalResponse,
  regularCommissionPercentage: { nominator: 5, denominator: 1000 },
};

describe("RulesService", () => {
  let service: RulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesService],
    }).compile();

    service = module.get<RulesService>(RulesService);
  });

  describe("Get commission amount", () => {
    it("should get correct commission amount for regular customer", () => {
      expect(service.getMinimumCommission(ruleInput_Regular)).toBe(
        parseFloat(fakeDB.clientRegular_CommissionResponse.amount),
      );
    });
    it("should get correct commission amount for special customer", () => {
      expect(service.getMinimumCommission(ruleInput_Special)).toBe(
        parseFloat(fakeDB.clientSpecial_CommissionResponse.amount),
      );
    });
    it("should get correct commission amount for high volume customer", () => {
      expect(service.getMinimumCommission(ruleInput_HighVolume)).toBe(
        parseFloat(fakeDB.clientHighVolume_CommissionResponse.amount),
      );
    });
    it("should get correct commission amount for regular customer for non-EUR currency", () => {
      expect(service.getMinimumCommission(ruleInput_RegularNonEUR)).toBe(
        parseFloat(fakeDB.clientRegularNonEUR_CommissionResponse.amount),
      );
    });
  });
});
