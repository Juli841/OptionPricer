"""Step 6: continuous-time model (GBM), CRR tree parametrisation, model interface.

Convention: T in years, mu / sigma / r annualised, r continuously compounded.
"""
from dataclasses import dataclass
from typing import Protocol

import numpy as np
from backend.services.multi_period import MultiPeriodResult
from backend.services.multi_period import price_multi_period
from backend.services.simulation import N_SAMPLE

MAX_PATHS = 100_000
MAX_STEPS = 1000
MAX_DRAWS = 20_000_000


@dataclass
class CrrParams:
    u: float  # e^{sigma sqrt(dt)}
    d: float  # 1/u
    r_step: float  # per-step rate to feed the existing tree: e^{r dt} - 1
    q: float  # risk-neutral up probability (1 + r_step - d) / (u - d)


def crr_params(sigma: float, r: float, T: float, n: int) -> CrrParams:
    """Map (sigma, r, T, n) to the binomial tree parameters. dt = T / n."""
    if(sigma <= 0 or T <= 0 or n < 1):
        raise ValueError("sigma, r, T, n must be positive.")
    dt = T/ n
    u = np.exp(sigma * np.sqrt(dt))
    d = 1 / u
    r_step = np.exp(r*dt) - 1
    if not d < 1 + r_step < u: raise ValueError("Arbitrage detected")
    return CrrParams(u,d,r_step, (1+r_step - d) / (u-d))


def price_crr(
    s0: float, k: float, sigma: float, r: float, T: float, n: int, kind: str
) -> MultiPeriodResult:
    """European price on the CRR tree: crr_params, then the existing price_multi_period."""
    p = crr_params(sigma, r, T, n)
    return price_multi_period(s0, k, p.u, p.d, p.r_step, n, kind)


N_BINS = 40  # histogram bins for the terminal log-returns


@dataclass
class GbmResult:
    times: list[float]  # n+1 time points 0, dt, ..., T (years)
    sample_paths: list[list[float]]  # up to N_SAMPLE paths, each n+1 prices (starts at s0)
    terminal_mean: float  # empirical mean of S_T
    terminal_std: float  # empirical standard deviation of S_T
    theoretical_mean: float  # s0 e^{mu T}
    theoretical_std: float  # sqrt(s0^2 e^{2 mu T} (e^{sigma^2 T} - 1))
    # histogram of ln(S_T / s0), theoretically N((mu - sigma^2/2) T, sigma^2 T)
    log_return_edges: list[float]  # N_BINS + 1 bin edges
    log_return_counts: list[int]  # N_BINS counts
    log_return_mean: float  # empirical mean of ln(S_T / s0)
    log_return_std: float  # empirical std
    theoretical_log_return_mean: float  # (mu - sigma^2/2) T
    theoretical_log_return_std: float  # sigma sqrt(T)


def simulate_gbm(
    s0: float, mu: float, sigma: float, T: float, n: int, paths: int, seed: int | None = None
) -> GbmResult:
    """Exact GBM on n+1 equally spaced times 0..T (no Euler error).

    S_{t+dt} = S_t * exp((mu - sigma^2/2) dt + sigma sqrt(dt) Z),  Z ~ N(0, 1).
    """
    if(s0 <= 0 or sigma <= 0 or T <= 0 or n > MAX_STEPS or n < 1 or paths < 1 or paths > MAX_PATHS or paths * n > MAX_DRAWS):
        raise ValueError("s0, mu, sigma, T, n must be positive.")
    rng = np.random.default_rng(seed)
    S = GBM(mu, sigma).sample(s0, T, n, paths, rng)
    sample_paths = S[:N_SAMPLE]
    times = np.linspace(0, T, n + 1)
    terminal_mean = np.mean(S[:, -1])
    terminal_std= np.std(S[:, -1])
    theoretical_mean = s0 * np.exp(mu * T)
    theoretical_std = np.sqrt(s0 ** 2 * np.exp(2 * mu * T) * (np.exp(sigma ** 2 * T) - 1))

    log_returns = np.log(S[:, -1] / s0)
    log_return_counts, log_return_edges = np.histogram(log_returns, bins = N_BINS)
    log_return_mean = np.mean(log_returns)
    log_return_std = np.std(log_returns)
    theoretical_log_return_mean = (mu - sigma ** 2/2) * T
    theoretical_log_return_std = sigma * np.sqrt(T)


    result = GbmResult(times.tolist(), sample_paths.tolist(), float(terminal_mean),
                       float(terminal_std), float(theoretical_mean), float(theoretical_std),
                       log_return_edges.tolist(), log_return_counts.tolist(), float(log_return_mean),
                       float(log_return_std), float(theoretical_log_return_mean), float(theoretical_log_return_std))
    return result


class Model(Protocol):
    """An asset model: all the pricers/hedgers need is raw paths."""

    def sample(
        self, s0: float, T: float, n: int, paths: int, rng: np.random.Generator
    ) -> np.ndarray:
        """Prices on n+1 equally spaced times 0..T, shape (paths, n+1), column 0 = s0."""
        ...


@dataclass
class BinomialModel:
    u: float
    d: float
    p: float  # up probability (use q for risk-neutral pricing)

    def sample(self, s0, T, n, paths, rng):  # T unused: the tree is indexed by steps
        ups = np.column_stack([np.zeros(paths, dtype=int), np.cumsum(rng.random((paths, n)) < self.p, axis=1)])
        return s0 * self.u ** ups * self.d ** (np.arange(n + 1) - ups)


@dataclass
class GBM:
    mu: float  # drift; pass r for risk-neutral pricing
    sigma: float

    def sample(self, s0, T, n, paths, rng):
        dt = T / n
        Z = rng.standard_normal((paths, n))
        log_steps = (self.mu - self.sigma ** 2 / 2) * dt + self.sigma * np.sqrt(dt) * Z
        return s0 * np.exp(np.column_stack([np.zeros(paths), np.cumsum(log_steps, axis=1)]))
