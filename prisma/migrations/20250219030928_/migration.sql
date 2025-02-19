-- CreateTable
CREATE TABLE "_InstructionsToRecipes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_InstructionsToRecipes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstructionsToRecipes_B_index" ON "_InstructionsToRecipes"("B");
