# Accordia Backend

Backend API Accordia menggunakan Bun, Express 5, Prisma 7, PostgreSQL, dan
Swagger UI. Fitur yang tersedia saat ini mencakup health/readiness serta
register dan login berbasis access token dan refresh token.

## Menjalankan secara lokal

```bash
bun install
docker compose up -d
bun run db:deploy
bun run db:generate
bun run dev
```

Endpoint yang tersedia:

- `GET http://localhost:3000/api/v1/health`
- `GET http://localhost:3000/api/v1/ready`
- `POST http://localhost:3000/api/v1/auth/register`
- `POST http://localhost:3000/api/v1/auth/login`
- Swagger UI: `http://localhost:3000/api-docs/`
- OpenAPI JSON: `http://localhost:3000/openapi.json`

Salin `.env.example` menjadi `.env`, lalu ganti `JWT_SECRET` dengan hasil
`openssl rand -hex 32` sebelum menggunakan project di luar development lokal.
Jika API berada di belakang Caddy pada host yang sama, atur `TRUST_PROXY=loopback`.

Contoh register:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Budi Santoso","email":"budi@example.com","password":"password-yang-kuat"}'
```

Contoh login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"budi@example.com","password":"password-yang-kuat"}'
```
