# Commission-API

## Introduction

Commission-API is a RESTful API with an endpoint for commission calculation and other endpoints for getting client related information. It gets request in JSON format and sends the responses also in JSON format.
</br>
</br>

## Endpoints
</br>
API endpoint for querying for commission transaction is:

    {APIURL}/commission/amount   : receives transaction data, sends commission data
    {APIURL}/client/details      : receives client ID, sends client details
    {APIURL}/client/transactions : receives client ID, sends client transaction history
    {APIURL}/client/specials     : receives client ID, sends client's special commission conditions
    {APIURL}/client/best_special : receives client ID, sends client's best (lowest) special commission condition
    {APIURL}/client/total        : receives client ID, sends client's total lifetime transaction amount
    {APIURL}/client/monthly_total: receives client ID date, sends client's total transaction amount for that month

## Requests and Responses:
</br>

### `/commission/amount` endpoint
Request format:
```
{
  "date"      : date of transaction, e.g. "2021-01-01",
  "amount"    : amount of transaction, e.g. "100.00",
  "currency"  : currency of transaction, e.g. "EUR",
  "client_id" : ID of the client, e.g. 42
}
```
Response format:
```
{
  "amount"  : amount of commission, e.g. "0.05",
  "currency": currency of commission, always "EUR"
}
```
</br>

### `/client/details` endpoint
Request format:
```
{
  "client_id": ID of client, e.g. 42
}
```
Response format:
```
{
  "id"          : ID of client, e.g. "9",
  "client_name" : name of the client, e.g. "Rice, Beatty and Runolfsson"
}
```
</br>

### `/client/transactions` endpoint
Request format: same as `/client/details` enpoint

Response format:
```
{
  "id"                        : ID of transaction, e.g. 1
  "client_id"                 : ID of the client, e.g. 42,
  "transaction_date"          : date of the transaction, e.g. "2021-06-09T00:00:00.000Z",
  "transaction_amount"        : amount of transaction, e.g. "1338",
  "transaction_currency"      : currency of transaction, e.g. "ERN",
  "commission_amount"         : amount of commission, e.g. "0.05",
  "commission_currency"       : currency of commission, always "EUR",
  "exchange_rate"             : exchange rate at the date of transaction, e.g. "16.526867",
  "transaction_amount_in_eur" : amount of transaction in EUR, e.g. "80.96"
}
```
</br>

### `/client/specials` endpoint
Request format: same as `/client/details` enpoint

Response format (an array of):
```
{
  "id"                :ID of special commission entry, e.g. 2,
  "client_id"         :ID of client, e.g. 9,
  "commission_amount" :amount of commission to be applied, e.g. "0.04",
  "is_active"         :active status of the special commission, e.g. true
}
```
</br>

### `/client/best_special` endpoint
Request format: same as `/client/details` enpoint

Response format:
```
{
  "client_id"                       : ID of the client, e.g. 9,
  "min_special_commission"          : minimum of the active special commissions, e.g. "0.04",
  "min_special_commission_currency" : currency of commission, always "EUR"
}
```
</br>

### `/client/total` endpoint
Request format: same as `/client/details` enpoint

Response format:
```
{
  "client_id" : ID of the client, e.g. 9,
  "amount"    : lifetime total of transactions, e.g. "7074.98",
  "currency"  : currency of amount, always "EUR"
}
```
</br>

### `/client/monthly_total` endpoint
Request format:
Request format:
```
{
  "client_id" : ID of client, e.g. 42
  "date"      : date which falls in the same month as the requested month, e.g. "2021-07-05"
}
```

Response format:
```
{
  "client_id" : ID of the client, e.g. 9,
  "date"      : first day of the request month, e.g. "2021-07-01T00:00:00.000Z"
  "amount"    : lifetime total of transactions, e.g. "130.45",
  "currency"  : currency of amount, always "EUR"
}
```
</br>

In case of errors, error is sent back to the client.

## Calculation of the commission amount:
There are three rules for calculating commission. Each rule is checked for each request, and the commission is calculated for each request separately (unless we are sure that there is no lower possible commission). The final commission is always the lowest calculated amount of these three.

Rule #1: Default pricing
By default the price for every transaction is 0.5% but not less than 0.05€.

Rule #2: Client with a discount
Some clients have special commission amounts defined for them. An example is below:
```
id      client_id    commission_amount  is_active
 1	       42             0.050000	      true
 2	        9	          0.040000	      true
 3	       10	          0.050000	      true
 4	       20	          0.050000	      false
 5	       30	          0.100000	      true
 6	       40	          5.000000	      false
 7	       50	          5.000000	      true
 9	        9	          0.100000	      true
10	        9	          0.030000	      false
12	        9	          0.010000	      false
13	       12	         10.000000	      true
```

The amounts in this table is in EUR.
In order to return a special commission amount, the client_id needs to be in clients_with_special_commission table and is_active for the entry should be true. It's possible to have more than one active entry per client, and some special commission amounts may be way higher than regular commissions for small transactions. Still, the minimum of all rules will be the effective commission amount.

Rule #3: High turnover discount
Client after reaching transaction turnover of 1000.00€ (per month) gets a discount and transaction commission is 0.03€ for the following transactions.

Transaction history:
API records transactions to the database, with the following information: 

```
client_id, date, amount, currency, commission_amount, commission_currency, exchange_rate, transaction_amount_in_eur
```

An example of historical data is below:
```
42,2021-01-02,2000.00,EUR,0.05,EUR
1,2021-01-03,500.00,EUR,2.50,EUR
1,2021-01-04,499.00,EUR,2.50,EUR
1,2021-01-05,100.00,EUR,0.50,EUR
1,2021-01-06,1.00,EUR,0.03,EUR
1,2021-02-01,500.00,EUR,2.50,EUR
```
This historical data is used for calculation for applying Rule #3 above.


## Technologies used:
Node.js with NestJS, Prisma, TypeScript

Database: PostgreSQL
Database used for this API is PostgreSQL hosted at ec2-52-18-116-67.eu-west-1.compute.amazonaws.com, database dca31jlgdfhhnh. (check DATABASE_URL environment variable)
There is also a shadow database which is used for Prisma migration (as the main DB is in the cloud with no create DB permission) (check SHADOW_DATABASE_URL environment variable)

Other APIs: Currency conversion API provided by exchangerate.host is used for conversions. API URL is https://api.exchangerate.host/convert. Please see related API documentation at https://exchangerate.host/#/docs

Additional packages:

class-validator
class-transformer
prisma
axios
dotenv


## Testing:
The API code is tested for the below:
### Unit tests:
Commission-API uses Jest with NestJS integration for unit tests.
Use `npm run test` to start unit tests.
The below modules are unit tested:
- commission.service:
  This module has 3 tests:
    Getting the correct commission amount for a regular customer,
    Getting the correct commission amount for a special customer,
    Getting the correct commission amount for a high volume customer.
- client.service
  This module has 2 tests:
    Getting the details for a client,
    Getting the lifetime transaction total for a client.
### Integration tests:
Commission-API uses supertest with NestJS integration for integration tests. In order to run the tests, docker cli is needed.
Use `npm run test:int` to start unit tests.
There are 7 integrations tests in 2 groups:
  - Creating clients, transactions, special conditions:
    Creating clients (regular, special, high volume)
    Creating transaction for the high volume client
    Creating special commission entry for special client
  - Calculating and returning commission
    Returning commission response for regular client
    Returning commission response for special client
    Returning commission response for high volume client
    Returning commission response for regular client for non-EUR currency


- client.service
  This module has 2 tests:
    Getting the details for a client,
    Getting the lifetime transaction total for a client.
### End-to-end tests:

test package used
number of tests (unit)
what is tested (unit)
number of tests (integration)
what is tested (integration)

## DB Tables:
table columns felan olsun burda

