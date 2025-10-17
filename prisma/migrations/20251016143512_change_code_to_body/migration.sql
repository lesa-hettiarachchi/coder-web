/*
  Warnings:

  - You are about to drop the column `code` on the `tabs` table. All the data in the column will be lost.
  - Added the required column `body` to the `tabs` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tabs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_tabs" ("createdAt", "id", "instructions", "title", "updatedAt") SELECT "createdAt", "id", "instructions", "title", "updatedAt" FROM "tabs";
DROP TABLE "tabs";
ALTER TABLE "new_tabs" RENAME TO "tabs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
