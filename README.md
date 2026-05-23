# Internal Space Announcement

Website quản lý các feature đã deploy của website chính Oroca.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- react-hook-form + zod
- react-markdown

## Setup

```bash
npm install
cp .env.example .env
```

Cập nhật `DATABASE_URL` trong `.env` bằng connection string PostgreSQL từ Neon, Vercel Postgres hoặc database nội bộ.

```bash
npm run db:migrate
npm run dev
```

Mở `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Notes

- Dashboard dùng URL search params: `?search=login&page=2`.
- `userGuide` hỗ trợ Markdown cơ bản qua `react-markdown` và không render HTML thô.
- `releaseDate` được lưu dạng `DATE` trong PostgreSQL và format nhất quán theo ngày để tránh lệch timezone.
