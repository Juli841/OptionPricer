# Options Pricing + Hedging Simulator — Project Roadmap

This roadmap is designed so that each new finance concept unlocks a new feature in the application. The project starts with discrete models you can already understand and remains open for extensions into continuous-time models, Monte Carlo methods, stochastic volatility, and more advanced derivatives pricing.

---

## 1. Build the First Binomial Pricing Engine

### Finance concepts
- One-period binomial model
- Risk-neutral probability
- No-arbitrage pricing
- Replicating portfolio
- Delta hedge

### Core formulas

\[
q = \frac{1+r-d}{u-d}
\]

\[
V_0 = \frac{1}{1+r}\left(qV_u + (1-q)V_d\right)
\]

\[
\Delta = \frac{V_u - V_d}{S_0u - S_0d}
\]

### Application features
- Input:
  - Initial stock price \(S_0\)
  - Strike \(K\)
  - Up factor \(u\)
  - Down factor \(d\)
  - Interest rate \(r\)
  - Call / Put
- Output:
  - Option price
  - Delta
  - Bond/cash position
- Visualize the one-period tree

### Goal
Create the first complete pricing + hedging workflow.

---

## 2. Extend to a Multi-Period Binomial Tree

### Finance concepts
- Multi-period binomial models
- Recombining trees
- Backward induction
- Conditional valuation

### Application features
- Add number of steps \(N\)
- Build the stock-price tree
- Build the option-value tree
- Perform backward induction
- Support:
  - European calls
  - European puts

### Visualization
For small \(N\), display the full tree.

For large \(N\), show summary results and convergence plots.

### Goal
Generalize the one-period engine into a reusable pricing engine.

---

## 3. Add American Options

### Finance concepts
- Early exercise
- Intrinsic value
- Continuation value
- Optimal stopping

At every node:

\[
V_n = \max\left(g(S_n), \frac{1}{1+r}E_n^Q[V_{n+1}]\right)
\]

### Application features
At each tree node display:
- Stock price
- Intrinsic value
- Continuation value
- Option value
- Exercise / Hold decision

### Goal
Understand why American options require backward decision-making rather than only discounted expectation.

---

## 4. Add a Path Simulator

### Finance concepts
- Random paths
- Random walks
- Simulation
- Distribution of future asset prices

### Application features
- Simulate binomial stock paths
- Allow configuration of:
  - Number of paths
  - Number of steps
- Plot simulated asset-price paths

### Goal
Move from deterministic pricing trees to stochastic simulation.

---

## 5. Build the Hedging Simulator

### Finance concepts
- Replication
- Dynamic hedging
- Rebalancing
- Self-financing portfolios

### Application features
For each time step track:
- Stock price
- Option price
- Delta
- Number of shares held
- Cash/bond position
- Portfolio value
- Option payoff

Example table:

| Time | Stock | Option | Delta | Shares | Cash | Portfolio |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 100.00 | 8.12 | 0.54 | 0.54 | -45.88 | 8.12 |

### Goal
Show numerically how a replicating portfolio reproduces the derivative payoff.

---

## 6. Introduce Continuous-Time Asset Models

### Finance concepts
- Continuous-time limit
- Brownian motion
- Geometric Brownian motion
- Stochastic differential equations

Start from a discrete model such as:

\[
S_{t+\Delta t}
=
S_t + \mu S_t\Delta t + \sigma S_t\sqrt{\Delta t}Z
\]

Then study the continuous-time model:

\[
dS_t = \mu S_tdt + \sigma S_tdW_t
\]

and its solution:

\[
S_t =
S_0
\exp\left[
\left(\mu-\frac12\sigma^2\right)t
+
\sigma W_t
\right]
\]

### Application features
Create a model interface so that the simulator can switch between:
- BinomialModel
- GBM

### Goal
Allow continuous-time models without redesigning the application.

---

## 7. Add Monte Carlo Option Pricing

### Finance concepts
- Risk-neutral valuation
- Monte Carlo estimation
- Standard error
- Confidence intervals
- Convergence

Risk-neutral pricing:

\[
V_0 = e^{-rT}E^Q[\text{Payoff}]
\]

Monte Carlo estimator:

\[
\hat V =
e^{-rT}
\frac{1}{M}
\sum_{i=1}^{M}
\text{Payoff}^{(i)}
\]

### Application features
Display:
- Monte Carlo price
- Number of simulations
- Standard error
- Confidence interval
- Convergence plot

### Goal
Build a generic pricing method that can later handle options without closed-form solutions.

---

## 8. Learn and Implement Black–Scholes

### Learning sequence
1. Brownian motion
2. Itô's lemma
3. GBM
4. Delta hedging
5. Elimination of risk
6. Black–Scholes PDE
7. Black–Scholes formula

For a European call:

\[
C = S_0N(d_1) - Ke^{-rT}N(d_2)
\]

where

\[
d_1 =
\frac{
\ln(S_0/K) + \left(r+\frac12\sigma^2\right)T
}{
\sigma\sqrt T
}
\]

\[
d_2 = d_1 - \sigma\sqrt T
\]

### Application features
Compare:
- Black–Scholes
- Binomial
- Monte Carlo

### Goal
Demonstrate numerically that the binomial model converges toward Black–Scholes.

---

## 9. Add Greeks

### Finance concepts

\[
\Delta = \frac{\partial V}{\partial S}
\]

\[
\Gamma = \frac{\partial^2V}{\partial S^2}
\]

\[
\Theta = \frac{\partial V}{\partial t}
\]

\[
\nu = \frac{\partial V}{\partial \sigma}
\]

\[
\rho = \frac{\partial V}{\partial r}
\]

### Implementation
First compute Greeks numerically using finite differences.

Example:

\[
\Delta \approx
\frac{V(S+h)-V(S-h)}{2h}
\]

Later implement analytical Black–Scholes Greeks.

### Application features
Compare:
- Analytical Greeks
- Numerical finite-difference Greeks

### Goal
Connect derivatives, numerical analysis, and financial risk sensitivities.

---

## 10. Build a Realistic Delta-Hedging Simulator

### Finance concepts
- Discrete hedging
- Hedging error
- Rebalancing frequency
- Transaction costs

### Application features
Allow hedge frequencies such as:
- Every minute
- Hourly
- Daily
- Weekly
- Monthly

Calculate:

\[
\text{Hedging Error}
=
\text{Portfolio Value}
-
\text{Option Payoff}
\]

### Visualizations
- Hedging error histogram
- Hedging P&L
- Error versus rebalancing frequency

### Goal
Show why real-world hedging differs from theoretical continuous hedging.

---

## 11. Add More Derivative Types

### Possible instruments
- Digital options
- Asian options
- Barrier options
- Lookback options
- Basket options

### Software goal
Keep payoff logic separate from pricing logic.

Possible structure:

```text
Payoff
├── CallPayoff
├── PutPayoff
├── DigitalPayoff
├── AsianPayoff
└── BarrierPayoff
```

### Goal
Make the pricing engines reusable across many instruments.

---

## 12. Add Implied Volatility and Market Data

### Finance concepts
- Implied volatility
- Root finding
- Market calibration
- Volatility smile

### Application features
- Input market option price
- Solve for implied volatility
- Load historical or market data
- Plot:
  - Implied volatility versus strike
  - Implied volatility versus maturity

### Goal
Move from theoretical models toward actual market usage.

---

## 13. Add Variance Reduction and Better Monte Carlo

### Finance concepts
- Antithetic variables
- Control variates
- Variance reduction
- Monte Carlo efficiency

### Application features
Compare:
- Standard Monte Carlo
- Antithetic Monte Carlo
- Control-variate Monte Carlo

Display:
- Price estimate
- Standard error
- Runtime
- Variance reduction

### Goal
Improve simulation quality without simply increasing the number of paths.

---

## 14. Add Advanced Pricing Models

Possible extensions:

### Models
- Local volatility
- Heston stochastic volatility
- Jump diffusion

### Pricing methods
- Finite-difference PDE solvers
- Longstaff–Schwartz for American options
- Advanced Monte Carlo methods

Possible architecture:

```text
MarketModel
├── BinomialModel
├── GBM
├── HestonModel
├── LocalVolModel
└── JumpDiffusionModel
```

### Goal
Allow advanced models to plug into the same simulator architecture.

---

## 15. Turn the Project into a Derivatives Analytics Platform

Once the foundations are stable, extend from one option to portfolios.

### Possible features
- Portfolio of derivatives
- Portfolio Greeks
- Scenario analysis
- Stress testing
- VaR
- Expected Shortfall
- Volatility surfaces
- Model comparison
- Calibration tools
- Historical backtesting

### Long-term architecture

```text
Frontend
│
├── Pricing
├── Simulation
├── Hedging
├── Greeks
├── Volatility
└── Portfolio Analytics

        ↓ API

Backend / Quant Engine
│
├── Instruments
├── Payoffs
├── Market Models
├── Pricing Engines
├── Hedging Strategies
├── Simulation
└── Risk Analytics
```

### Goal
Evolve the original learning project into a modular quantitative-finance application.

---

# Suggested Version Milestones

| Version | Main Feature |
|---|---|
| V0.1 | European call/put with binomial pricing |
| V0.2 | American options |
| V0.3 | Path simulation |
| V0.4 | Hedging simulation |
| V0.5 | Geometric Brownian motion |
| V0.6 | Monte Carlo pricing |
| V0.7 | Black–Scholes |
| V0.8 | Greeks |
| V0.9 | Continuous/discrete delta-hedging simulation |
| V1.0 | Market data + implied volatility |

---

# Recommended Learning Order

```text
Binomial pricing
        ↓
Replication / no-arbitrage
        ↓
Risk-neutral probability
        ↓
Martingales
        ↓
Multi-period models
        ↓
American options
        ↓
Random walks
        ↓
Brownian motion
        ↓
Stochastic differential equations
        ↓
Itô's lemma
        ↓
Geometric Brownian motion
        ↓
Risk-neutral pricing in continuous time
        ↓
Black–Scholes PDE
        ↓
Black–Scholes formula
        ↓
Greeks
        ↓
Delta hedging
        ↓
Monte Carlo
        ↓
Implied volatility
        ↓
Advanced models
```

---

# Core Design Principle

The UI should not know how an option is priced.

It should only ask a pricing engine for a result.

For example:

```text
React UI
    ↓
FastAPI
    ↓
PricingEngine
    ├── BinomialEngine
    ├── BlackScholesEngine
    ├── MonteCarloEngine
    └── Future Engines
```

This separation is what will allow the project to grow without requiring major rewrites.
