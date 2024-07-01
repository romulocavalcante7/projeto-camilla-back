/*
  Warnings:

  - You are about to drop the `AttachmentTranslation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[attachmentId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[attachmentId]` on the table `Subniche` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AttachmentTranslation" DROP CONSTRAINT "AttachmentTranslation_attachmentId_fkey";

-- DropForeignKey
ALTER TABLE "StickerTranslation" DROP CONSTRAINT "StickerTranslation_attachmentId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "attachmentId" TEXT;

-- AlterTable
ALTER TABLE "StickerTranslation" ALTER COLUMN "attachmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subniche" ADD COLUMN     "attachmentId" TEXT;

-- DropTable
DROP TABLE "AttachmentTranslation";

-- CreateTable
CREATE TABLE "CategoryAttachment" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,

    CONSTRAINT "CategoryAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubnicheAttachment" (
    "id" TEXT NOT NULL,
    "subnicheId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,

    CONSTRAINT "SubnicheAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryAttachment_attachmentId_key" ON "CategoryAttachment"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SubnicheAttachment_attachmentId_key" ON "SubnicheAttachment"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_attachmentId_key" ON "Category"("attachmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subniche_attachmentId_key" ON "Subniche"("attachmentId");

-- AddForeignKey
ALTER TABLE "CategoryAttachment" ADD CONSTRAINT "CategoryAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubnicheAttachment" ADD CONSTRAINT "SubnicheAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickerTranslation" ADD CONSTRAINT "StickerTranslation_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subniche" ADD CONSTRAINT "Subniche_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
