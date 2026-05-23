CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Member_name_key" ON "Member"("name");
CREATE INDEX "Member_name_idx" ON "Member"("name");

INSERT INTO "Member" ("id", "name", "updatedAt")
VALUES
    ('seed_leo_nguyen', 'Leo Nguyen', CURRENT_TIMESTAMP),
    ('seed_duong_quoc_vinh', 'Dương Quốc Vĩnh', CURRENT_TIMESTAMP),
    ('seed_nhi_bui', 'Nhi Bùi', CURRENT_TIMESTAMP),
    ('seed_vo_manh_cuong', 'Võ Mạnh Cường', CURRENT_TIMESTAMP),
    ('seed_nguyen_thi_tu_ngoc', 'Nguyễn Thị Tú Ngọc', CURRENT_TIMESTAMP),
    ('seed_nguyen_dang_tan', 'Nguyễn Đăng Tân', CURRENT_TIMESTAMP),
    ('seed_tran_nguyen_chi_huy', 'Trần Nguyễn Chí Huy', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
