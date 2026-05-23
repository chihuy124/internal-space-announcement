ALTER TABLE "Member" ADD COLUMN "username" TEXT;

UPDATE "Member"
SET "username" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE("name", '[^[:alnum:]]+', '.', 'g'),
    '(^\.+|\.+$)',
    '',
    'g'
  )
);

UPDATE "Member"
SET "username" = CONCAT('member.', SUBSTRING("id" FROM 1 FOR 8))
WHERE "username" IS NULL OR "username" = '';

ALTER TABLE "Member" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "Member_username_key" ON "Member"("username");
CREATE INDEX "Member_username_idx" ON "Member"("username");
