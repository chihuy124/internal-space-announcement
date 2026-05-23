ALTER TABLE "Member" ADD COLUMN "passwordHash" TEXT;

CREATE INDEX "Member_passwordHash_idx" ON "Member"("passwordHash");
