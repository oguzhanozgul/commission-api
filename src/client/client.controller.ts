import { Body, Controller, Get } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientDateDto, ClientDto } from "./dto";

@Controller("client")
export class ClientController {
  constructor(private clientService: ClientService) {}

  // end point to get client details
  @Get("details")
  calculateCommission(@Body() clientDto: ClientDto) {
    return this.clientService.clientDetails(clientDto);
  }

  // end point to get all transactions of the client
  @Get("transactions")
  clientTransactions(@Body() clientDto: ClientDto) {
    return this.clientService.clientTransactions(clientDto);
  }

  // end point to get special commission conditions of the client
  @Get("specials")
  clientSpecials(@Body() clientDto: ClientDto) {
    return this.clientService.clientSpecials(clientDto);
  }

  // end point to get special commission conditions of the client
  @Get("best_special")
  clientBestSpecial(@Body() clientDto: ClientDto) {
    return this.clientService.clientBestSpecial(clientDto);
  }

  // end point to get lifetime total value of transactions of the client in EUR
  @Get("total")
  clientTotal(@Body() clientDto: ClientDto) {
    return this.clientService.clientTotal(clientDto);
  }
  // end point to get lifetime total value of transactions of the client in EUR
  @Get("monthly_total")
  clientMonthlyTotal(@Body() clientDateDto: ClientDateDto) {
    return this.clientService.clientMonthlyTotal(clientDateDto);
  }
}
