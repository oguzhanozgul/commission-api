-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "client_name" VARCHAR(255),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients_with_special_commission" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "commission_amount" DECIMAL(15,6) NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "clients_with_special_commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "transaction_date" DATE NOT NULL,
    "transaction_amount" DECIMAL(15,6) NOT NULL,
    "transaction_currency" VARCHAR(3) NOT NULL,
    "commission_amount" DECIMAL(15,6) NOT NULL,
    "commission_currency" VARCHAR(3) NOT NULL,
    "exchange_rate" DECIMAL(15,6) NOT NULL,
    "transaction_amount_in_eur" DECIMAL(15,6) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fki_client_id_fkey" ON "clients_with_special_commission"("client_id");

-- AddForeignKey
ALTER TABLE "clients_with_special_commission" ADD CONSTRAINT "client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
