# Commission-API

## Table of Contents
1. [Introduction](#introduction)</br>
2. [Endpoints](#endpoints)</br>
3. [Requests and Responses](#requests-and-responses)</br>
  a. [/commission/amount endpoint](#commissionamount-endpoint)</br>
  b. [/client/details endpoint](#clientdetails-endpoint)</br>
  c. [/client/transactions endpoint](#clienttransactions-endpoint)</br>
  d. [/client/specials endpoint](#clientspecials-endpoint)</br>
  e. [/client/best_special endpoint](#clientbest_special-endpoint)</br>
  f. [/client/total endpoint](#client/total-endpoint)</br>
  g. [/client/monthly_total endpoint](#clientmonthly_total-endpoint)</br>

4. [Commission Calculation Rules](#commission-calculation-rules)</br>
5. [Database](#database)</br>
6. [Technologies used](#technologies-used)</br>
  a. [Language](#language)</br>
  b. [Framework](#framework)</br>
  c. [Database](#techdatabase)</br>
  d. [Cloud platform](#cloud-platform)</br>
  e. [External APIs](#external-apis)</br>
  f. [Notable packages](#notable-packages)</br>
7. [Testing](#testing)</br>
  a. [Unit tests](#unit-tests)</br>
  b. [Integration tests](#integration-tests)</br>
  c. [End-to-end tests](#end-to-end-tests)</br>

## Introduction
Commission-API is a RESTful API with an endpoint for commission calculation and other endpoints for getting client related information. It gets request in JSON format and sends the responses also in JSON format.</br>
To use, fork and clone to local, use `npm install` to install node modules and dependencies. Then use `npm start` or `npm run start:dev` to run, `npm run test` for unit tests,  `npm run test:int` for integration tests and  `npm run test:e2e` for end-to-end tests.
</br>
## Endpoints
API endpoint for querying for commission transaction is:

    /commission/amount   : receives transaction data, sends commission data
    /client/details      : receives client ID, sends client details
    /client/transactions : receives client ID, sends client transaction history
    /client/specials     : receives client ID, sends client's special commission conditions
    /client/best_special : receives client ID, sends client's best (lowest) special commission condition
    /client/total        : receives client ID, sends client's total lifetime transaction amount
    /client/monthly_total: receives client ID date, sends client's total transaction amount for that month
## Requests and Responses:
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

## Commission Calculation Rules:
There are three rules for calculating commission. Each rule is checked for each request and the commission is calculated for each request separately. The final commission is always the lowest calculated amount of commission amounts resulting from the rules.
</br></br>
### Rule #1: Default pricing
By default the price for every transaction is 0.5% but not less than 0.05€.
</br></br>
### Rule #2: Client with a discount
Some clients have special commission amounts defined for them. An example is below:
```
id      client_id    commission_amount  is_active
 1	       42             0.050000	      true
 2	        9	          0.040000	      true
 9	        9	          0.100000	      true
10	        9	          0.030000	      false
```

The amounts in this table are in EUR.</br></br>
In order to return a special commission amount, the client_id needs to be in clients_with_special_commission table and is_active for the entry should be true. It's possible to have more than one active entry per client, and some special commission amounts may be way higher than regular commissions for small transactions. Still, the minimum of all rules will be the effective commission amount.
</br></br>

### Rule #3: High turnover discount
Client after reaching transaction turnover of 1000.00€ (per month) gets a discount and transaction commission is 0.03€ for the following transactions.
</br></br>

### Adding additional rules:
In case needed, additional rules can be added within the rule set in `rules.service`. Each rule is a defined function, which gets pushed to the `rules` array and is executed in order. There is a method within the same service that returns the minimum amount.</br></br>

## Database
Commission-API uses PostgreSQL. Both databases below are hosted by heroku.
</br></br>

### Production database (check `DATABASE_URL` environment variable)
```
URL     : ec2-52-18-116-67.eu-west-1.compute.amazonaws.com
Database: dca31jlgdfhhnh
```

### Production shadow database (check `SHADOW_DATABASE_URL` environment variable)

```
URL     : ec2-52-48-159-67.eu-west-1.compute.amazonaws.com
Database: ddj5al718fq1f7
```
Shadow database was needed for Prisma during migration.

### Test database
PostgreSQL running at `localhost:5435` deployed by Docker in `docker-compose.yml`
 ### Diagram
Database has 3 tables, the schema is outlined below, in `/prisma/schema.prisma` and in `/database/commission_api-database_schema.drawio`
</br>

![Commission-API database diagram](/database/database-outline.png?raw=true)

Table `clients`: This is where client data is kept.
</br></br>
Table `clients_with_special_commission`: This is where special commission conditions for clients are kept.
</br></br>
Table `transactions`: This is where transaction history is kept. Transaction history is recorded when there is a request to `/commission/amount` endpoint and when calculating monthly transaction amounts. Below is the structure of
</br></br>

## Technologies used:
### Language:
- Typescript</br>
### Framework:
- NestJS in Node.js
### Database: <a name="techdatabase"></a>
- PostgreSQL
### Containerization:
- Docker (for the testing database)
### Cloud platform:
- heroku

### External APIs:
- Currency conversion API provided by exchangerate.host for conversions.</br>
  - API URL: https://api.exchangerate.host/convert</br>
  - API documentation: https://exchangerate.host/#/docs

### Notable packages:

- prisma</br>
- Jest</br>
- supertest</br>
- currency.js</br>
- axios</br>
- dotenv and dotenv-cli</br>
- class-validator</br>
- class-transformer</br>
</br>

## Testing
### Unit tests:
Commission-API uses Jest with NestJS integration for unit tests.</br>
Use `npm run test` to start unit tests.</br>
The below modules are unit tested:
- `commission.service`: This module has 3 tests:</br>
  - Getting the correct commission amount for a regular customer,</br>
  - Getting the correct commission amount for a special customer,</br>
  - Getting the correct commission amount for a high volume customer.</br></br>
- `client.service`: This module has 2 tests:</br>
  - Getting the details for a client,</br>
  - Getting the lifetime transaction total for a client.</br></br>
- `rules.service`: This module has 4 tests:</br>
  - Getting the correct commission amount for a regular customer,</br>
  - Getting the correct commission amount for a special customer,</br>
  - Getting the correct commission amount for a high volume customer,</br>
  - Getting the correct commission amount for a regular customer for non-EUR currency.</br></br>
### Integration tests:
Commission-API uses supertest with NestJS integration for integration tests. In order to run the tests, docker cli is needed.</br>
Use `npm run test:int` to start unit tests.</br>
There are 7 integrations tests in 2 groups:</br>
  - Creating clients, transactions, special conditions:</br>
    - Creating clients (regular, special, high volume)</br>
    - Creating transaction for the high volume client</br>
    - Creating special commission entry for special client</br></br>
  - Calculating and returning commission</br>
    - Returning commission response for regular client</br>
    - Returning commission response for special client</br>
    - Returning commission response for high volume client</br>
    - Returning commission response for regular client for non-EUR currency</br></br>

### End-to-end tests:
Currently there is 1 end-to-end test which tests `/client/details` endpoint. More end-to-end tests can be added.
