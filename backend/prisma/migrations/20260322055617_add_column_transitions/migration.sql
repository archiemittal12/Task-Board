-- CreateTable
CREATE TABLE "ColumnTransition" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "fromColumnId" TEXT NOT NULL,
    "toColumnId" TEXT NOT NULL,

    CONSTRAINT "ColumnTransition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColumnTransition_fromColumnId_toColumnId_key" ON "ColumnTransition"("fromColumnId", "toColumnId");

-- AddForeignKey
ALTER TABLE "ColumnTransition" ADD CONSTRAINT "ColumnTransition_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnTransition" ADD CONSTRAINT "ColumnTransition_fromColumnId_fkey" FOREIGN KEY ("fromColumnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColumnTransition" ADD CONSTRAINT "ColumnTransition_toColumnId_fkey" FOREIGN KEY ("toColumnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
