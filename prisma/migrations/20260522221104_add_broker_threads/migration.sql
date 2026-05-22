-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "brokerThreadId" TEXT;

-- CreateTable
CREATE TABLE "BrokerThread" (
    "id" TEXT NOT NULL,
    "brokerName" TEXT NOT NULL,
    "brokerEmail" TEXT NOT NULL,
    "brokerPhone" TEXT,
    "brokerCompany" TEXT,
    "emailThreadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "lastEmailAt" TIMESTAMP(3) NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 1,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "mentionedAddresses" TEXT[],
    "mentionedPrices" INTEGER[],
    "userAsks" TEXT[],
    "brokerAsks" TEXT[],
    "addedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerThread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrokerThread_emailThreadId_key" ON "BrokerThread"("emailThreadId");

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_brokerThreadId_fkey" FOREIGN KEY ("brokerThreadId") REFERENCES "BrokerThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerThread" ADD CONSTRAINT "BrokerThread_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
