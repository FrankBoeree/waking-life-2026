# Dekmantel Festival 2026 — Timetable PWA

Unofficial fan-made timetable and lineup companion for **Dekmantel Festival 2026** (31 July – 2 August 2026, Amsterdamse Bos). Works offline as a progressive web app.

Not affiliated with Dekmantel organizers. Official site: [dekmantelfestival.com](https://dekmantelfestival.com/)

## Features

- Timetable view across 7 stages and 3 festival days
- Lineup view with search, filters, and favorites
- Artist bios with Resident Advisor and SoundCloud links
- Offline support via service worker and IndexedDB
- Installable PWA for home screen use

## Development

```bash
npm install
npm run dev
```

## Data import

Timetable and artist bios are imported from the organizer Excel file:

```bash
npm run build:timetable
npm run import:artist-info -- "/path/to/Dekmantel Schedule with short bios and soundcloud.xlsx"
npm run build
```

## Deploy

The site is a static Next.js export published to Netlify (`out/`). Connect the Git repository to Netlify and use:

- Build command: `npm run netlify-build`
- Publish directory: `out`

### Supabase (favorite counts)

Global favorite counts are stored in Supabase project **Dekmantel festival 2026**. Copy `.env.local.example` to `.env.local` for local development, and add the same variables in Netlify → Site settings → Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Schema migrations live in `supabase/migrations/`.

## Disclaimer

Schedules can change. Always verify critical information with official Dekmantel channels.
