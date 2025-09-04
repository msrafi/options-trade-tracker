
# Options Trade Tracker (React + Vite + Tailwind)

Local-first tracker for options/stock trades with optional Supabase sync, CSV/JSON import/export,
and a clean dashboard.

## Quick Start
```bash
npm i
npm run dev
```

Open the URL shown by Vite.

## Features
- LocalStorage persistence
- Optional Supabase Push/Pull (enter URL & anon key under **Cloud Sync**)
- CSV/JSON import and JSON export
- Settings: Options contract multiplier
- Minimal design system (atoms)
- Dashboard (monthly P&L bar, strategy distribution pie)

## Create table in Supabase (optional)
```sql
create table if not exists trades (
  id uuid primary key,
  created_at timestamptz default now(),
  data jsonb
);
```
