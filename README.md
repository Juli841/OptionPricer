# Option Pricer

> Interactive option pricing and hedging in the binomial model: price trees, early exercise, Monte Carlo paths and a replicating portfolio you can watch work.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/roadmap-8%20of%2015%20steps-orange)

A learning project with a real engineering shape: a tested numerical backend (Python, NumPy, FastAPI) and a typed React frontend that makes the mathematics visible. It is built step by step from a [15-step roadmap](options_pricing_hedging_simulator_roadmap.md) towards a derivatives analytics platform. **Steps 1–8 are done**, plus user accounts (register, login, profile photo, username).

<!-- Add screenshots here: the European tree and the Hedging page -->

## Table of contents

- [Features](#features)
- [The finance in one paragraph](#the-finance-in-one-paragraph)
- [Tech stack](#tech-stack)
- [Accounts and security](#accounts-and-security)
- [Architecture](#architecture)
- [API](#api)
- [Getting started](#getting-started)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Known limitations](#known-limitations)
- [How this was built](#how-this-was-built)

## Features

| Page | What you can do |
|---|---|
| **European** | Price a European call or put on an n-step binomial tree (n up to 1000). For n ≤ 12 the full stock / option / delta tree is drawn, with nodes coloured by option value, in-the-money nodes ringed, and a per-level inspector. |
| **American** | The same tree for American options. Shows the exercise-or-hold decision at every node, plus the hedge with **consumption** (Shreve's formulation): intrinsic value, continuation value, consumption and bond. |
| **Paths** | Monte Carlo simulation of stock paths under the real-world probability *p* or the risk-neutral probability *q*. Sample paths (centred on the mean or as prices, with click-to-highlight) and a histogram of up-moves against the exact binomial distribution, with empirical vs theoretical mean and standard deviation. |
| **Hedging** | Pick a path (flip up/down steps by hand, or randomise it) and watch a self-financing portfolio of shares and cash replicate the option. The portfolio equals the option value **at every time step**, and the payoff at expiry. |
| **GBM** | Continuous-time model with annualised μ, σ, r and T in years. Exact geometric Brownian motion paths against the expected path S₀e^(μt), the terminal and log-return moments against their closed forms, and the histogram of ln(S_T/S₀) against its normal density. A CRR panel prices a European option on a tree with u = e^(σ√Δt), d = 1/u and shows the price converging as the tree grows. |
| **Monte Carlo** | Price a European call or put as the discounted mean payoff over M risk-neutral GBM paths (drift r). Shows the price, standard error and 95% confidence interval, and a convergence plot (running estimate with its band narrowing like 1/√M) against a fine CRR tree as an independent reference. |
| **Black–Scholes** | Closed-form price of a European call or put with d₁, d₂, N(d₁) (the delta) and N(d₂). A convergence table compares it with a 1000-step CRR tree and a 200 000-path Monte Carlo run (with its confidence interval), and a chart plots the price against S₀ next to the payoff at expiry. |
| **Welcome and account** | A welcome page links to every tool. Register and log in with email, username and a strong password (live strength meter, show/hide eye). The account page holds your profile photo (upload, change, remove) and lets you change your username. Only the account page needs a login; the pricing pages stay open. |

Also: light/dark theme (follows the system, saved locally, toggle in the top bar), collapsible sidebar, seeded and reproducible simulations, input validation with readable errors.

## The finance in one paragraph

Over one period a stock goes up by a factor *u* or down by *d*. A call or put payoff can be reproduced exactly by holding **Δ shares and a cash position**, so the option's no-arbitrage price is the cost of that portfolio. This equals the discounted expectation of the payoff under the **risk-neutral probability** q = (1 + r − d)/(u − d). Chaining *n* periods gives a recombining tree priced by backward induction. The hedge ratio Δ is re-read from the tree at each node, and the portfolio evolves as X′ = Δ·S′ + (1+r)(X − Δ·S). The Hedging page shows this numerically: whichever path the stock takes, X ends exactly at the payoff, and the real-world probability never enters the replication.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Accounts | PostgreSQL, SQLAlchemy, argon2-cffi (password hashes), PyJWT (session token in an httpOnly cookie) |
| Numerics | NumPy (vectorised backward induction and path simulation), SciPy (normal distribution for Black–Scholes) |
| Frontend | React 19, TypeScript, Vite, React Router |
| Charts | Recharts for paths and histograms, hand-written SVG for the trees |
| Testing | pytest (backend); `tsc`, ESLint and a production build (frontend) |
| Dev setup | the Vite dev server proxies `/api` to the FastAPI app |

## Accounts and security

Login is deliberately plain session-cookie authentication, not OAuth.

- **Passwords** are hashed with argon2 (random salt, never stored or logged). Registration enforces 8–128 characters with a lowercase letter, an uppercase letter, a number and a symbol, on the server and in the form (the rules live in `backend/user/schemas/auth.py` and `frontend/src/utils/password.ts`; keep them in sync). Login accepts any stored password.
- **Session:** after login the server sets a signed JWT (1 hour) in an `httpOnly`, `SameSite=Lax` cookie, so page JavaScript cannot read it. `COOKIE_SECURE=1` adds the `Secure` flag behind HTTPS. `current_user` (`backend/user/session.py`) is the dependency that protects a route.
- **Errors do not leak:** a wrong email and a wrong password give the same 401 message, and every authentication failure on a protected route gives one "Not authenticated".
- **Emails** are normalised (Unicode NFKC, trimmed, case-folded) and unique case-insensitively; **usernames** (3–20 letters, digits or `_`) are unique case-insensitively through a database index, which also settles two simultaneous sign-ups.
- **Profile photo:** PNG, JPEG or WebP up to 2 MB, stored in Postgres. The type is decided from the file's first bytes, not from what the browser claims, and the size is checked while reading.

Not done yet (see [Known limitations](#known-limitations)): rate limiting, email verification, password reset, token revocation, two-step authentication.

## Architecture

```
backend/
  main.py            builds the FastAPI app, creates the tables, includes the routers
  db.py              SQLAlchemy engine, session per request, Base
  pricing/
    controllers/     HTTP routes (health, pricing, simulation, hedging, continuous, montecarlo, blackscholes);
                     engine errors become 422s
    schemas/         Pydantic request models and validation (caps, no-arbitrage guards)
    services/        pure Python / NumPy engines, no web code:
                       binomial.py      one-period price, delta, bond
                       multi_period.py  n-period European tree
                       american.py      American tree with exercise + consumption
                       simulation.py    vectorised random-walk path simulator
                       hedging.py       replication along a given path
                       continuous.py    GBM simulator, CRR parametrisation, Model interface
                       montecarlo.py    Monte Carlo pricer with convergence series
                       blackscholes.py  closed-form price, d1, d2, N(d1), N(d2)
  user/
    controllers/     auth.py (register, login, logout, me, username), avatar.py (photo)
    schemas/         credentials, registration rules, user output
    services/        auth.py (hashing, tokens, register), avatar.py (validation, storage)
    models/          user.py (the users table)
    session.py       cookie helpers and the current_user dependency
  tests/             pytest suites per engine, plus accounts
frontend/src/
  api/ hooks/ types/ utils/   typed fetch clients, state hooks, shared types, password and username rules
  context/ + AuthProvider     who is logged in (useAuth)
  components/                 forms, trees, charts, tables, avatar, password meter, route guard, layout
  pages/                      Welcome, European, American, Paths, Hedging, Continuous, MonteCarlo,
                              BlackScholes, Login/Register, Account
```

Engines are kept free of web code so they can be tested directly and reused in later steps (Monte Carlo pricing, Greeks, discrete hedging). `BinomialModel` and `GBM` share one small `Model` interface (`sample()` returns a `(paths, n+1)` price array), so later steps can switch models without redesigning the app.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | liveness check |
| POST | `/api/price/one-period` | one-period price, delta, bond, q |
| POST | `/api/price/multi-period` | European n-period tree (full trees for n ≤ 12) |
| POST | `/api/price/american` | American tree with exercise, continuation, consumption, bond |
| POST | `/api/simulate` | random paths, up-move histogram, empirical vs theoretical moments |
| POST | `/api/hedge` | replicating portfolio along a given up/down path |
| POST | `/api/gbm/simulate` | exact GBM paths, terminal and log-return moments, log-return histogram |
| POST | `/api/gbm/crr` | European price on the CRR tree built from (σ, r, T, n), with u, d, q |
| POST | `/api/mc/price` | Monte Carlo price, standard error, 95% interval and convergence series |
| POST | `/api/bs/price` | Black–Scholes price with d₁, d₂, N(d₁), N(d₂) |
| POST | `/api/auth/register` | create an account (email, username, password) and log in (201) |
| POST | `/api/auth/login` | log in with email and password, sets the session cookie |
| POST | `/api/auth/logout` | clears the cookie (204) |
| GET | `/api/auth/me` | the logged-in user; 401 otherwise |
| PATCH | `/api/auth/username` | change your username |
| POST / GET / DELETE | `/api/auth/avatar` | upload, fetch or remove your profile photo |

Invalid input and arbitrage (`d < 1 + r < u` violated) return `422` with a readable message; a taken email or username returns `409`; a missing or bad session returns `401`. FastAPI also serves interactive docs at `/docs` when the backend is running.

## Getting started

Requirements: Python 3.11+, Node 20+ and a running PostgreSQL.

Create a database and a `.env` file at the repo root (it is git-ignored):

```sql
CREATE USER optionpricer WITH PASSWORD 'choose-one';
CREATE DATABASE optionpricer OWNER optionpricer;
```

```
DATABASE_URL=postgresql+psycopg://optionpricer:choose-one@localhost:5432/optionpricer
JWT_SECRET=<64 random hex characters, e.g. python -c "import secrets; print(secrets.token_hex(32))">
COOKIE_SECURE=0   # set to 1 behind HTTPS
```

The tables are created on startup. There are no migrations yet: if a model gains a column, add it to the existing table by hand (`ALTER TABLE ...`).

```bash
git clone https://github.com/Juli841/OptionPricer.git
cd OptionPricer

# backend (repo root)
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload       # http://127.0.0.1:8000

# frontend (second terminal)
cd frontend
npm install
npm run dev                                       # http://localhost:5173
```

## Testing

```bash
python -m pytest backend/tests                    # 129 tests
cd frontend && npx tsc -b && npx eslint . && npm run build
```

The engines are checked against independent references rather than only against themselves:

- **Brute force:** the tree price equals the expectation over *all* 2ⁿ paths (n up to 12).
- **Consistency:** an N = 1 multi-period tree equals the one-period engine, and put–call parity holds.
- **American:** the wealth equation δ·S′ + (1+r)·bond = V′ holds at every node, and the American value is at least the European value and the intrinsic value.
- **Simulation:** the same seed reproduces, empirical mean and std agree with the closed forms, degenerate probabilities (p = 0, 1) behave, and caps are enforced.
- **Hedging:** for every one of the 64 paths of length 6, for calls and puts, the final portfolio equals the payoff and the portfolio equals the option value at every step.
- **Continuous time:** the same seed reproduces, terminal and log-return moments match the closed forms, the number of steps does not change the law of S_T (exact GBM steps), and the CRR price converges to the Black–Scholes value (used only as an independent limit; Black–Scholes itself is Step 8) and satisfies put–call parity with a continuous rate.
- **Monte Carlo and Black–Scholes:** the Monte Carlo price agrees with a fine CRR tree within the standard error, the running variance stays finite on near-constant payoffs, and Black–Scholes satisfies put–call parity and matches the CRR limit.
- **Accounts:** password hashes are salted and verify, tokens round-trip and reject tampering, weak passwords and malformed usernames are rejected, avatar types are detected from bytes (an HTML file labelled PNG is refused), and oversized or empty images fail before the database is touched. The register, login, session and photo flows were also exercised end to end against Postgres with FastAPI's test client.
- **Inputs:** arbitrage, out-of-range sizes and malformed paths are rejected.

There are no automated UI tests, and the database-backed account flow is checked by script rather than in the test suite.

## Roadmap

The full plan is in [`options_pricing_hedging_simulator_roadmap.md`](options_pricing_hedging_simulator_roadmap.md).

- [x] 1. One-period binomial pricing engine
- [x] 2. Multi-period tree (European)
- [x] 3. American options (early exercise, consumption)
- [x] 4. Path simulator
- [x] 5. Hedging simulator (replication along a path)
- [x] 6. Continuous-time asset models
- [x] 7. Monte Carlo option pricing
- [x] 8. Black–Scholes
- [ ] 9. Greeks
- [ ] 10. Realistic discrete delta-hedging and hedging error
- [ ] 11–15. More derivatives, implied volatility, variance reduction, advanced models, analytics platform

## Known limitations

- Full trees and the hedging table are limited to n ≤ 12 (larger n returns the price only, up to n = 1000). The Hedging page is European-only for now.
- The rate *r* is per step (`1 + r`) on the binomial pages; only the GBM page uses an annual, continuously compounded rate.
- Node colours compare an option value to the initial premium, undiscounted. This is a visual heuristic, not a P&L.
- The sample standard deviation of terminal prices uses `ddof=0`; the choice is still open.
- The pricing endpoints are open to anyone, including the expensive Monte Carlo one (up to 10⁶ paths); there is no rate limiting.
- Accounts: no rate limiting on login, no email verification or password reset, no way to revoke a token before its hour is up, and no two-step authentication.
- No database migrations; schema changes are applied by hand.
- No API-level automated tests for the pricing endpoints.

## How this was built

This is a deliberate learning project. For each step the finance concept is worked through first.
