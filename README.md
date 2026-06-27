# World Cup Bets — Frontend

React SPA for the World Cup Bets 2026 app. Predict scores, compete with friends.

## Stack

- **React 18** + **TypeScript 5** + **Vite 5**
- **React Router 6** — client-side routing
- **TanStack Query 5** — server state management
- **Axios** — HTTP client with JWT interceptor
- **@react-oauth/google** — Google OAuth button

## Getting Started

```bash
# Clone
git clone https://github.com/DrRotstein/world-cup-bets-frontend.git
cd world-cup-bets-frontend

# Install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   VITE_API_URL=http://localhost:3000
#   VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Run dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |

## Deployment (Railway)

The app deploys as a static site served by `serve`:

```bash
npm run build
npx serve dist -s -l $PORT
```

Railway configuration is in `railway.json`. Set environment variables in Railway dashboard.

## Screens

1. **Landing / Login** — Google OAuth sign-in
2. **Dashboard** — List groups, create/join groups
3. **Group View** — Matches with bet inputs, leaderboard tab, members tab
4. **Match Betting** — Score prediction (integrated in Group View)
5. **Leaderboard** — Ranked table with expandable per-match breakdown

## Project Structure

```
src/
├── api/
│   ├── client.ts       # Axios instance + JWT interceptor
│   └── endpoints.ts    # All API calls
├── context/
│   └── AuthContext.tsx  # Auth state + Google login
├── pages/
│   ├── Landing.tsx      # Login screen
│   ├── Dashboard.tsx    # Groups list
│   ├── GroupView.tsx    # Group detail + matches + bets
│   └── Leaderboard.tsx  # Full leaderboard + breakdown
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Routes + providers
├── main.tsx             # Entry point
└── index.css            # Global styles (mobile-first)
```

## License

TBD
