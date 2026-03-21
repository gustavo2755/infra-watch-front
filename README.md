# Infra Watch Frontend

React + TypeScript frontend for the Infra Watch API.

## Stack

- React 18+
- TypeScript (strict mode)
- Vite
- Tailwind CSS v4
- React Router DOM

## Setup

```bash
npm install
cp .env.example .env
```

Configure `VITE_API_URL` in `.env` to point to your Infra Watch backend.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Routes

- `/login` - Login (public)
- `/servers` - Server list and CRUD (protected)
- `/service-checks` - Service checks list and CRUD (protected)
