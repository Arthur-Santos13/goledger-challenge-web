# FLIXDB — GoLedger Challenge Web

A web interface for a blockchain-backed TV show catalogue, built as a solution for the [GoLedger Challenge](https://github.com/goledgerdev/goledger-challenge-web). It lets you create and manage TV Shows, Seasons, Episodes and Watchlists through a REST API running on Hyperledger Fabric.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the project](#running-the-project)
- [Tests](#tests)
- [Folder structure](#folder-structure)
- [Features](#features)
- [Architecture](#architecture)
- [API](#api)

---

## Overview

**FLIXDB** is an IMDb-style application for cataloguing TV series. Data is persisted on a blockchain (Hyperledger Fabric) via REST API. The interface supports creating, editing, viewing and deleting all chain assets, plus client-side search by title/description and TMDB integration for automatic poster fetching.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| HTTP | Axios |
| Posters | TMDB API |
| Tests | Jest 30, Testing Library 16 |
| Language | TypeScript 5 |

---

## Prerequisites

- Node.js 18+
- npm 9+
- GoLedger API credentials (Basic Auth)
- *(Optional)* TMDB API key for automatic poster loading

---

## Setup

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/goledger-challenge-web.git
cd goledger-challenge-web
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file at the project root with the following variables:

```env
# GoLedger API base URL (without trailing /api)
NEXT_PUBLIC_API_URL=http://ec2-50-19-36-138.compute-1.amazonaws.com/api

# Basic Auth credentials provided by email
NEXT_PUBLIC_API_USERNAME=your_username
NEXT_PUBLIC_API_PASSWORD=your_password

# (Optional) TMDB key for automatic poster search
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
```

> Without the TMDB key the application works normally — cards display a placeholder icon instead of a poster.

---

## Running the project

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

### Lint and formatting

```bash
npm run lint
npm run format
```

---

## Tests

The project has **178 tests** split across two layers:

### Unit tests (112)

Cover the `lib/`, `services/` and `hooks/` layers in isolation.

```bash
npm test
```

### Integration tests (66)

Render full components and pages with mocked services, verifying create, edit, delete and search flows end-to-end.

```bash
npm test -- --testPathPattern=integration
```

### With coverage

```bash
npm run test:coverage
```

### Watch mode

```bash
npm run test:watch
```

---

## Folder structure

```
src/
├── app/                        # Routes (Next.js App Router)
│   ├── page.tsx                # Home page
│   ├── tv-shows/
│   │   ├── page.tsx            # TV Shows list
│   │   └── [title]/
│   │       ├── page.tsx        # TV Show detail + seasons
│   │       └── seasons/[seasonNumber]/
│   │           └── page.tsx    # Season episodes
│   └── watchlist/
│       └── page.tsx            # Watchlists
│
├── components/
│   ├── episodes/               # EpisodeCard, EpisodeForm
│   ├── layout/                 # Header
│   ├── seasons/                # SeasonCard, SeasonForm
│   ├── tv-shows/               # TvShowCard, TvShowForm
│   ├── ui/                     # Button, Input, Textarea, Modal,
│   │                           # ConfirmDialog, EmptyState, LoadingSpinner
│   └── watchlist/              # WatchlistCard, WatchlistForm
│
├── hooks/                      # useTvShows, useSeasons, useEpisodes, useWatchlist
├── lib/                        # axios.ts, tmdb.ts, posterCache.ts, utils.ts
├── services/                   # api.ts, tvshows.ts, seasons.ts, episodes.ts, watchlist.ts
├── types/                      # index.ts — all TypeScript types
└── __tests__/
    ├── lib/                    # Unit tests for lib/
    ├── services/               # Unit tests for services/
    ├── hooks/                  # Unit tests for hooks/
    └── integration/            # Integration tests for components and pages
```

---

## Features

### TV Shows
- Grid listing with poster (via TMDB), age rating badge and average score
- Real-time search by title or description
- Creation with automatic poster and description lookup from TMDB
- Edit (description and age rating)
- Cascade deletion: removes all seasons, episodes and watchlist references

### Seasons
- Listed per TV Show, sorted by number
- Create and edit (number, year)
- Cascade deletion of all child episodes

### Episodes
- Listed per season, sorted by number
- Create and edit (number, title, release date, description, rating 0–10)
- Individual deletion
- Average rating computed per season and per TV Show

### Watchlists
- Listed with series count
- Search by title or description
- Create and edit with multi-select TV Show checkboxes
- Deletion

---

## Architecture

The application follows a layered architecture:

```
Pages (app/)
    └── Hooks (hooks/)           ← orchestrate state + service calls
        └── Services (services/) ← domain-typed functions
            └── API (lib/axios)  ← HTTP client with Basic Auth
```

- **Services** are pure functions that delegate to `services/api.ts`, which centralises the `searchAssets`, `createAsset`, `updateAsset`, `deleteAsset` and `readAsset` endpoints.
- **Hooks** encapsulate loading/error state and expose stable callbacks (`create`, `update`, `remove`, `refetch`) via `useCallback`. Mutations trigger automatic re-fetch through a `refreshKey` counter.
- **Components** are decoupled from fetching logic — they receive data and callbacks via props.
- **Ratings** on the TV Show list are computed with **2 batch API calls** (all seasons + all episodes), avoiding N×M individual calls per card.

---

## API

The API follows the GoLedger Chaincode REST standard:

| Operation | Method | Endpoint |
|---|---|---|
| Search assets | POST | `/query/search` |
| Read asset | POST | `/query/readAsset` |
| Create asset | POST | `/invoke/createAsset` |
| Update asset | PUT | `/invoke/updateAsset` |
| Delete asset | DELETE | `/invoke/deleteAsset` |

All requests use **Basic Auth** (configured in `src/lib/axios.ts`).

Swagger available at: `http://ec2-50-19-36-138.compute-1.amazonaws.com/api-docs/index.html`
