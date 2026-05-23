CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "ticket" TEXT,
    "ticketName" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "releaseDate" DATE NOT NULL,
    "userGuide" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Feature_ticketName_idx" ON "Feature"("ticketName");
CREATE INDEX "Feature_ticket_idx" ON "Feature"("ticket");
CREATE INDEX "Feature_assignee_idx" ON "Feature"("assignee");
CREATE INDEX "Feature_releaseDate_idx" ON "Feature"("releaseDate");
