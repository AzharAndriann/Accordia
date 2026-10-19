# Accordia Backend

Bootstrap backend API Accordia menggunakan Bun, Express 5, Prisma 7, PostgreSQL,
dan Swagger UI. Tahap awal ini menyediakan endpoint health dan readiness.

## Menjalankan secara lokal

```bash
bun install
docker compose up -d
bun run db:migrate --name init
bun run db:generate
bun run dev
```

Endpoint yang tersedia:

- `GET http://localhost:3000/api/v1/health`
- `GET http://localhost:3000/api/v1/ready`
- Swagger UI: `http://localhost:3000/api-docs/`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

Salin `.env.example` menjadi `.env`, lalu ganti `JWT_SECRET` dengan hasil
`openssl rand -hex 32` sebelum menggunakan project di luar development lokal.
