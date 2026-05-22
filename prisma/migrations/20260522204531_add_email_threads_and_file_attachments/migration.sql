-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN     "emailThreadId" TEXT,
ADD COLUMN     "lastEmailAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual_upload',
    "gmailMessageId" TEXT,
    "gmailAttachmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
