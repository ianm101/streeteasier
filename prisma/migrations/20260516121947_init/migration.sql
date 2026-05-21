-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "googleRefreshToken" TEXT,
    "gmailHistoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "unit" TEXT,
    "neighborhood" TEXT,
    "borough" TEXT,
    "price" INTEGER,
    "beds" DOUBLE PRECISION,
    "baths" DOUBLE PRECISION,
    "sqft" INTEGER,
    "floor" INTEGER,
    "listingUrl" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'interested',
    "brokerName" TEXT,
    "brokerEmail" TEXT,
    "brokerPhone" TEXT,
    "floorPlanUrl" TEXT,
    "screenshotUrl" TEXT,
    "photoUrls" TEXT[],
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "descriptionSummary" TEXT,
    "salientFeatures" TEXT[],
    "notes" TEXT,
    "addedById" TEXT NOT NULL,
    "pointPersonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartmentAmenity" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "ApartmentAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentAmenity_apartmentId_key_key" ON "ApartmentAmenity"("apartmentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_apartmentId_userId_key" ON "Ranking"("apartmentId", "userId");

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_pointPersonId_fkey" FOREIGN KEY ("pointPersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentAmenity" ADD CONSTRAINT "ApartmentAmenity_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
