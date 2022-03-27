import { Injectable, NotFoundException } from "@nestjs/common";
import { ClientDateDto, ClientDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClientService {
  constructor(private prismaService: PrismaService) {}

  async clientDetails(clientDto: ClientDto) {
    const client = await this.prismaService.clients.findUnique({
      where: {
        id: clientDto.client_id,
      },
    });
    if (!client) throw new NotFoundException("Client not found.");
    return client;
  }

  async clientTransactions(clientDto: ClientDto) {
    const transactions = await this.prismaService.transactions.findMany({
      where: {
        client_id: clientDto.client_id,
      },
    });
    if (transactions.length === 0)
      throw new NotFoundException("No transactions found for the client.");
    return transactions;
  }

  async clientSpecials(clientDto: ClientDto) {
    const specialConditions =
      await this.prismaService.clients_with_special_commission.findMany({
        where: {
          client_id: clientDto.client_id,
          is_active: true,
        },
      });
    if (specialConditions.length === 0)
      throw new NotFoundException(
        "No special conditions found for the client.",
      );
    return specialConditions;
  }

  async clientBestSpecial(clientDto: ClientDto) {
    let minCommission = null;

    const specialConditions =
      await this.prismaService.clients_with_special_commission.findMany({
        where: {
          client_id: clientDto.client_id,
          is_active: true,
        },
      });

    if (specialConditions.length !== 0) {
      // create array of commissions and find minimum (note: all in this array are active, non-actives are not in the above specialConditions)
      const commissions = specialConditions.map((x) => x.commission_amount);
      minCommission = commissions.reduce((a, b) => (a < b ? a : b));
    }

    return {
      client_id: clientDto.client_id,
      min_special_commission: minCommission,
      min_special_commission_currency: "EUR",
    };
  }

  async clientTotal(clientDto: ClientDto) {
    const transactionTotal = await this.prismaService.transactions.aggregate({
      where: {
        client_id: clientDto.client_id,
      },
      _sum: {
        transaction_amount_in_eur: true,
      },
    });
    if (!transactionTotal)
      throw new NotFoundException("No transactions found for the client.");

    const res = {
      client_id: clientDto.client_id,
      amount: transactionTotal._sum.transaction_amount_in_eur ?? "0.00",
      currency: "EUR",
    };

    return res;
  }

  async clientMonthlyTotal(clientDateDto: ClientDateDto) {
    // calculate the month beginning of the given date and the beginning of the next month
    const begDate = new Date(clientDateDto.date);
    begDate.setDate(1);
    const endDate = new Date(begDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const transactionTotal = await this.prismaService.transactions.aggregate({
      where: {
        client_id: clientDateDto.client_id,
        transaction_date: {
          gte: begDate,
          lt: endDate,
        },
      },
      _sum: {
        transaction_amount_in_eur: true,
      },
    });

    const res = {
      client_id: clientDateDto.client_id,
      date: begDate,
      amount: transactionTotal._sum.transaction_amount_in_eur ?? "0.00",
      currency: "EUR",
    };
    return res;
  }
}
