/*
  Warnings:

  - A unique constraint covering the columns `[identityId]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "identityId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_identityId_key" ON "Tenant"("identityId");
