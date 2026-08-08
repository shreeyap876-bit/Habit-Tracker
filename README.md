# Habit Tracker

A MERN habit tracker with Google sign-in and an AI habit coach powered by Google Gemini.
Track a weekly grid of habits, watch streaks build, and get coaching grounded in your own data.

- **Frontend** — React 18 + Vite, React Router, plain CSS design tokens
- **Backend** — Node.js + Express, JWT session in an httpOnly cookie
- **Database** — MongoDB with Mongoose
- **AI** — Google Gemini (`generateContent` REST API)

---

## Features

| Area | What it does |
| --- | --- |
| Email & password auth | Sign-up and log-in pages with inline validation, bcrypt-hashed passwords (cost 12), and generic errors so the API cannot be used to discover which emails have accounts |
| Google authentication | Google Identity Services on the client, ID-token verification on the server, session issued as an httpOnly JWT cookie |
| Account linking | Signing in with Google on an email that already has a password account links the two, rather than creating a duplicate |
| Protected routes | `/dashboard`, `/habits`, `/coach` and `/insights` require a session; the route remembers where you were headed |
| Habits | Create, edit, archive and delete habits with an emoji, colour and frequency (daily / chosen weekdays / N times a week) |
| Weekly tracker | Seven check circles per habit, optimistic toggling, week-by-week navigation, future days locked |
| Streaks & stats | Current and longest streaks, weekly completion rate, 14-day trend, 16-week consistency heatmap |
| AI habit coach | Chat grounded in your live habit snapshot, a daily nudge on the dashboard, and three coaching tones |

---

## Project structure

```
Web Project/
├── client/                     React + Vite app
│   └── src/
│       ├── api/                axios instance and typed API wrappers
│       ├── components/         auth, layout, ui primitives, habits, dashboard, coach
│       ├── context/            AuthContext, HabitsContext
│       ├── hooks/              useApi, useClickOutside
│       ├── pages/              Login, Register, Dashboard, Habits, Coach, Insights, NotFound
│       ├── routes/             ProtectedRoute, PublicRoute
│       ├── styles/             tokens, base, components, layout, pages
│       └── utils/              date helpers, habit theming
└── server/                     Express API
    └── src/
        ├── config/             env, database, constants
        ├── controllers/        auth, habit, log, stats, coach
        ├── middleware/         auth, validate, rate limits, error handler
        ├── models/             User, Habit, HabitLog, ChatMessage
        ├── routes/             route definitions and Zod schemas
        ├── services/           googleAuth, gemini, stats
        └── utils/              ApiError, asyncHandler, date
```

---

## Getting started

### 1. Install

```bash
npm run install:all
```

### 2. Configure environment variables

Copy both example files and fill in your own values:

```bash
cp server/.env.example server/.env && cp client/.env.example client/.env
```

**`server/.env`**

| Variable | What it is |
| --- | --- |
| `MONGODB_URI` | Connection string from your MongoDB Atlas project |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 **Web** client ID from Google Cloud Console |
| `JWT_SECRET` | Long random string — generate with `openssl rand -hex 64` |
| `GEMINI_API_KEY` | API key from Google AI Studio |
| `CLIENT_URL` | Origin of the client, used for CORS |

**`client/.env`**

| Variable | What it is |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | The same Google client ID as the server |
| `VITE_API_BASE_URL` | `/api` for local development (uses the Vite proxy) |
| `VITE_API_PROXY_TARGET` | Where the dev server proxies `/api`, default `http://localhost:5001` |

In Google Cloud Console, add `http://localhost:5173` to the client's **Authorised JavaScript
origins** so the sign-in button will render locally.

### 3. Run

```bash
npm run dev
```

The API starts on `http://localhost:5001` and the client on `http://localhost:5173`.
The Vite dev server proxies `/api` to the backend, which keeps the session cookie same-origin.

---

## API reference

All routes are prefixed with `/api`. Everything except `GET /health` and the three sign-in
routes requires the session cookie.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check and whether the coach is configured |
| `POST` | `/auth/register` | Create an account from a name, email and password |
| `POST` | `/auth/login` | Exchange an email and password for a session |
| `POST` | `/auth/google` | Exchange a Google ID token for a session |
| `GET` | `/auth/me` | Current user (restores the session on reload) |
| `PATCH` | `/auth/me` | Update name or coaching tone |
| `POST` | `/auth/logout` | Clear the session cookie |
| `GET` | `/habits` | List habits (`?includeArchived=true` for all) |
| `POST` | `/habits` | Create a habit |
| `GET` | `/habits/:id` | One habit with its streak and completion dates |
| `PATCH` | `/habits/:id` | Update or archive a habit |
| `DELETE` | `/habits/:id` | Delete a habit and its history |
| `GET` | `/logs?start=&end=` | Completions in a date range |
| `POST` | `/logs/toggle` | Tick a habit off for a day, or untick it |
| `GET` | `/stats/overview?date=` | Today, this week, streaks and the 14-day trend |
| `GET` | `/stats/heatmap?date=&days=` | Daily completion counts for the heatmap |
| `GET` | `/coach/history` | Conversation history |
| `POST` | `/coach/chat` | Send a message and get the coach's reply |
| `GET` | `/coach/tip` | A short personalised nudge |
| `DELETE` | `/coach/history` | Clear the conversation |

---

## Notes on the design

- Dates are stored as plain `YYYY-MM-DD` keys, and the client always sends **its own** local
  date. A habit ticked off at 11pm belongs to that day, not to the server's timezone.
- A completion is the presence of a `HabitLog` document, so ticking is a create and unticking is
  a delete — there is no third state to reconcile.
- Streaks are counted in days for daily and weekday habits, and in weeks for "N times a week"
  habits. Today (or the current week) never breaks a streak, since it is not over yet.
- The coach never sees anything beyond a compact snapshot of your habit stats and the last few
  turns of conversation.
- Passwords are bcrypt-hashed by a `pre('save')` hook on the model, so no controller can store
  plaintext by accident. The field is `select: false` and has to be asked for explicitly.
- Login failures return one generic message whether the email is unknown or the password is
  wrong. The one exception is a Google-only account, where saying so is more helpful than
  letting the user retype a password they never set.

## Troubleshooting

**`Could not connect to any servers in your MongoDB Atlas cluster`**
Your current IP is not on the cluster's allowlist. In Atlas go to **Network Access → Add IP
Address**, and either click *Add Current IP Address* or use `0.0.0.0/0` for development.

**`The model "..." is not available to your API key`**
Older Gemini models such as `gemini-2.5-flash` are closed to newly created API keys. Set
`GEMINI_MODEL` in `server/.env` to a current one — `gemini-3.6-flash` is a good default. To see
what your key can use:

```bash
curl -s -H "x-goog-api-key: $GEMINI_API_KEY" "https://generativelanguage.googleapis.com/v1beta/models"
```

**The Google button does not appear on the login page**
`VITE_GOOGLE_CLIENT_ID` is missing from `client/.env`, or `http://localhost:5173` is not listed
under the OAuth client's authorised JavaScript origins. Restart the dev server after editing
`.env` — Vite only reads it at startup.

## Deployment

The client and server deploy independently.

1. **Server** — set every variable from `server/.env.example`, plus `NODE_ENV=production` and
   `CLIENT_URL` pointing at the deployed client origin. When the two are on different domains the
   session cookie is issued with `SameSite=None; Secure`, which requires HTTPS on both.
2. **Client** — run `npm run build` and serve `client/dist`. Set `VITE_API_BASE_URL` to the
   deployed API, for example `https://your-api.onrender.com/api`.
3. Add the deployed client origin to the Google OAuth client's authorised JavaScript origins.
