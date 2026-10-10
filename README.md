# Option Pricer

> Interactive option pricing and hedging in the binomial model: price trees, early exercise, Monte Carlo paths and a replicating portfolio you can watch work.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/roadmap-6%20of%2015%20steps-orange)

A learning project with a real engineering shape: a tested numerical backend (Python, NumPy, FastAPI) and a typed React frontend that makes the mathematics visible. It is built step by step from a [15-step roadmap](options_pricing_hedging_simulator_roadmap.md) towards a derivatives analytics platform. **Steps 1–6 are done.**

<!-- Add screenshots here: the European tree and the Hedging page -->

## Table of contents

- [Features](#features)
- [The finance in one paragraph](#the-finance-in-one-paragraph)
- [Tech stack](#tech-stack)
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

Also: light/dark theme (follows the system, saved locally), collapsible sidebar, seeded and reproducible simulations, input validation with readable errors.

## The finance in one paragraph

Over one period a stock goes up by a factor *u* or down by *d*. A call or put payoff can be reproduced exactly by holding **Δ shares and a cash position**, so the option's no-arbitrage price is the cost of that portfolio. This equals the discounted expectation of the payoff under the **risk-neutral probability** q = (1 + r − d)/(u − d). Chaining *n* periods gives a recombining tree priced by backward induction. The hedge ratio Δ is re-read from the tree at each node, and the portfolio evolves as X′ = Δ·S′ + (1+r)(X − Δ·S). The Hedging page shows this numerically: whichever path the stock takes, X ends exactly at the payoff, and the real-world probability never enters the replication.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Numerics | NumPy (vectorised backward induction and path simulation) |
| Frontend | React 19, TypeScript, Vite, React Router |
| Charts | Recharts for paths and histograms, hand-written SVG for the trees |
| Testing | pytest (backend); `tsc`, ESLint and a production build (frontend) |
| Dev setup | the Vite dev server proxies `/api` to the FastAPI app |

## Architecture

```
backend/
  main.py          builds the FastAPI app, includes the routers
  controllers/     HTTP routes (health, pricing, simulation, hedging, continuous); engine errors become 422s
  schemas/         Pydantic request models and validation (caps, no-arbitrage guards)
  services/        pure Python / NumPy engines, no web code:
                     binomial.py      one-period price, delta, bond
                     multi_period.py  n-period European tree
                     american.py      American tree with exercise + consumption
                     simulation.py    vectorised random-walk path simulator
                     hedging.py       replication along a given path
                     continuous.py    GBM simulator, CRR parametrisation, Model interface
  tests/           pytest suites per engine
frontend/src/
  api/ hooks/ types/   typed fetch clients, state hooks, shared types per feature
  components/          forms, tree, level inspector, charts, tables
  pages/               European, American, Paths, Hedging, Continuous
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

Invalid input and arbitrage (`d < 1 + r < u` violated) return `422` with a readable message. FastAPI also serves interactive docs at `/docs` when the backend is running.

## Getting started

Requirements: Python 3.11+ and Node 20+.

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
python -m pytest backend/tests                    # 103 tests
cd frontend && npx tsc -b && npx eslint . && npm run build
```

The engines are checked against independent references rather than only against themselves:

- **Brute force:** the tree price equals the expectation over *all* 2ⁿ paths (n up to 12).
- **Consistency:** an N = 1 multi-period tree equals the one-period engine, and put–call parity holds.
- **American:** the wealth equation δ·S′ + (1+r)·bond = V′ holds at every node, and the American value is at least the European value and the intrinsic value.
- **Simulation:** the same seed reproduces, empirical mean and std agree with the closed forms, degenerate probabilities (p = 0, 1) behave, and caps are enforced.
- **Hedging:** for every one of the 64 paths of length 6, for calls and puts, the final portfolio equals the payoff and the portfolio equals the option value at every step.
- **Continuous time:** the same seed reproduces, terminal and log-return moments match the closed forms, the number of steps does not change the law of S_T (exact GBM steps), and the CRR price converges to the Black–Scholes value (used only as an independent limit; Black–Scholes itself is Step 8) and satisfies put–call parity with a continuous rate.
- **Inputs:** arbitrage, out-of-range sizes and malformed paths are rejected.

There are no automated UI or API integration tests yet; the endpoints have been checked by hand with `curl`.

## Roadmap

The full plan is in [`options_pricing_hedging_simulator_roadmap.md`](options_pricing_hedging_simulator_roadmap.md).

- [x] 1. One-period binomial pricing engine
- [x] 2. Multi-period tree (European)
- [x] 3. American options (early exercise, consumption)
- [x] 4. Path simulator
- [x] 5. Hedging simulator (replication along a path)
- [x] 6. Continuous-time asset models
- [x] 7. Monte Carlo option pricing
- [ ] 8. Black–Scholes
- [ ] 9. Greeks
- [ ] 10. Realistic discrete delta-hedging and hedging error
- [ ] 11–15. More derivatives, implied volatility, variance reduction, advanced models, analytics platform

## Known limitations

- Full trees and the hedging table are limited to n ≤ 12 (larger n returns the price only, up to n = 1000). The Hedging page is European-only for now.
- The rate *r* is per step (`1 + r`) on the binomial pages; only the GBM page uses an annual, continuously compounded rate.
- Node colours compare an option value to the initial premium, undiscounted. This is a visual heuristic, not a P&L.
- The sample standard deviation of terminal prices uses `ddof=0`; the choice is still open.
- No API-level automated tests yet.

## How this was built

This is a deliberate learning project. For each step the finance concept is worked through first.
