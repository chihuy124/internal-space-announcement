ALTER TABLE "Member" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "Member" SET "sortOrder" = 1 WHERE "name" = 'Leo Nguyen';
UPDATE "Member" SET "sortOrder" = 2 WHERE "name" = 'Dương Quốc Vĩnh';
UPDATE "Member" SET "sortOrder" = 3 WHERE "name" = 'Nhi Bùi';
UPDATE "Member" SET "sortOrder" = 4 WHERE "name" = 'Võ Mạnh Cường';
UPDATE "Member" SET "sortOrder" = 5 WHERE "name" = 'Nguyễn Thị Tú Ngọc';
UPDATE "Member" SET "sortOrder" = 6 WHERE "name" = 'Nguyễn Đăng Tân';
UPDATE "Member" SET "sortOrder" = 7 WHERE "name" = 'Trần Nguyễn Chí Huy';

CREATE INDEX "Member_sortOrder_idx" ON "Member"("sortOrder");
