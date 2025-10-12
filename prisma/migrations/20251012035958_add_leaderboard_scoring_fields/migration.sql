-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leaderboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerName" TEXT NOT NULL,
    "finalScore" INTEGER NOT NULL,
    "leaderboardScore" INTEGER NOT NULL DEFAULT 0,
    "timeCompleted" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 1800,
    "maxPossibleScore" INTEGER NOT NULL DEFAULT 675,
    "stagesCompleted" INTEGER NOT NULL,
    "gameMode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_leaderboard" ("createdAt", "finalScore", "gameMode", "id", "playerName", "stagesCompleted", "timeCompleted", "updatedAt") SELECT "createdAt", "finalScore", "gameMode", "id", "playerName", "stagesCompleted", "timeCompleted", "updatedAt" FROM "leaderboard";
DROP TABLE "leaderboard";
ALTER TABLE "new_leaderboard" RENAME TO "leaderboard";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
