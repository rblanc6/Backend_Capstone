/*
  Warnings:

  - A unique constraint covering the columns `[instruction]` on the table `Instructions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Instructions_instruction_key" ON "Instructions"("instruction");
