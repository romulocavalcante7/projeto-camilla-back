-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'PT', 'ES');

-- CreateTable
CREATE TABLE "AttachmentTranslation" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "AttachmentTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StickerTranslation" (
    "id" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,

    CONSTRAINT "StickerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubnicheTranslation" (
    "id" TEXT NOT NULL,
    "subnicheId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SubnicheTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentTranslation_attachmentId_language_key" ON "AttachmentTranslation"("attachmentId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "StickerTranslation_stickerId_language_key" ON "StickerTranslation"("stickerId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_language_key" ON "CategoryTranslation"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "SubnicheTranslation_subnicheId_language_key" ON "SubnicheTranslation"("subnicheId", "language");

-- AddForeignKey
ALTER TABLE "AttachmentTranslation" ADD CONSTRAINT "AttachmentTranslation_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickerTranslation" ADD CONSTRAINT "StickerTranslation_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "Sticker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StickerTranslation" ADD CONSTRAINT "StickerTranslation_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubnicheTranslation" ADD CONSTRAINT "SubnicheTranslation_subnicheId_fkey" FOREIGN KEY ("subnicheId") REFERENCES "Subniche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
