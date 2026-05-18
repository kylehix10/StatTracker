PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "seasonId" TEXT NOT NULL,
    "homeTeamId" TEXT,
    "awayTeamId" TEXT,
    "opponentName" TEXT,
    CONSTRAINT "Game_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Game" ("id", "date", "seasonId", "homeTeamId", "awayTeamId", "opponentName")
SELECT "id", "date", "seasonId", "homeTeamId", "awayTeamId", NULL
FROM "Game";

DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
