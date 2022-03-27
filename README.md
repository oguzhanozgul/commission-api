# tryout_backend

This is a RESTful API with an endpoint for commission calculation.

Requests:
This API gets transaction requests in the following JSON format:

{
  "date": "2021-01-01",
  "amount": "100.00",
  "currency": "EUR",
  "client_id": 42
}

date: The date when the transaction took place.
amount: Total amoun of the transaction, excluding commissions.
currency: Current of the transaction. It can be any currency.
client_id: The ID number of the client.

Endpoints:

API endpoint for querying for commission transaction is:

    {APIURL}/commission/amount   : receives transaction data, sends commission data
    {APIURL}/client/details      : receives client ID, sends client details
    {APIURL}/client/transactions : receives client ID, sends client transaction history
    {APIURL}/client/specials     : receives client ID, sends client's special commission conditions
    {APIURL}/client/best_special : receives client ID, sends client's best (lowest) special commission condition
    {APIURL}/client/total        : receives client ID, sends client's total lifetime transaction amount
    {APIURL}/client/monthly_total: receives client ID date, sends client's total transaction amount for that month

Response:
The response is in JSON format:

{
  "amount": "0.05",
  "currency": "EUR"
}

amount: amount of commission
currency: currency of commission, always in EUR

In case of errors, error is sent back to the client.

Calculation of the commission amount:
There are three rules for calculating commission. Each rule is checked for each request, and the commission is calculated for each request separately (unless we are sure that there is no lower possible commission). The final commission is always the lowest calculated amount of these three.

Rule #1: Default pricing
By default the price for every transaction is 0.5% but not less than 0.05€.

Rule #2: Client with a discount
Transaction price for the client with ID of 42 is 0.05€ (unless other rules set lower commission).

Rule #3: High turnover discount
Client after reaching transaction turnover of 1000.00€ (per month) gets a discount and transaction commission is 0.03€ for the following transactions.

Transaction history:
API records transactions to the database, with the following information: 
client_id, date, amount, currency, commission_amount, commission_currency, exchange_rate, transaction_amount_in_eur

An example of historical data is below:

42,2021-01-02,2000.00,EUR,0.05,EUR
1,2021-01-03,500.00,EUR,2.50,EUR
1,2021-01-04,499.00,EUR,2.50,EUR
1,2021-01-05,100.00,EUR,0.50,EUR
1,2021-01-06,1.00,EUR,0.03,EUR
1,2021-02-01,500.00,EUR,2.50,EUR

This historical data is used for calculation for applyin Rule #3 above.

API URL:
This API is currently hosted at:
https://tryout-backend.herokuapp.com/

Technologies used:
Node.js with NestJS, Prisma, TypeScript

Database: PostgreSQL
Database used for this API is PostgreSQL hosted at ec2-52-18-116-67.eu-west-1.compute.amazonaws.com, database dca31jlgdfhhnh. (check DATABASE_URL environment variable)

Other APIs: Currency conversion API provided by exchangerate.host is used for conversions. API URL is https://api.exchangerate.host/convert. Please see related API documentation at https://exchangerate.host/#/docs

Additional packages:

class-validator
class-transformer
prisma
axios

DB Tables:
table columns felan olsun burda

Testing:
test package used
number of tests (unit)
what is tested (unit)
number of tests (integration)
what is tested (integration)