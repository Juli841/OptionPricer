"""Step 4: simulate random binomial stock paths (numpy, vectorised over paths)."""
from dataclasses import dataclass

import numpy as np

MAX_PATHS = 100_000
MAX_STEPS = 1000
MAX_DRAWS = 20_000_000  # paths * steps, keeps the up/down grid at ~20 MB
N_SAMPLE = 50  # paths returned for plotting


@dataclass
class SimulationResult:
    p: float  # up probability that was used
    sample_paths: list[list[float]]  # up to N_SAMPLE paths, each n+1 prices (starts at s0)
    ups_counts: list[int]  # ups_counts[j] = number of paths that ended with j ups (n+1 entries)
    terminal_mean: float  # empirical mean of S_n
    terminal_std: float  # empirical standard deviation of S_n
    theoretical_mean: float  # S0 * (p*u + (1-p)*d)^n
    theoretical_std: float  # sqrt(Var S_n),


def simulate_paths(
    s0: float, u: float, d: float, n: int, p: float, paths: int, seed: int | None = None
) -> SimulationResult:
    if not 1 <= n <= MAX_STEPS:
        raise ValueError(f"n must be between 1 and {MAX_STEPS}")
    if not 1 <= paths <= MAX_PATHS:
        raise ValueError(f"paths must be between 1 and {MAX_PATHS}")
    if paths * n > MAX_DRAWS:
        raise ValueError(f"paths * n must be at most {MAX_DRAWS}")
    if not 0 <= p <= 1:
        raise ValueError("p must be between 0 and 1")

    rng = np.random.default_rng(seed)
    up = rng.random((paths, n)) < p
    total_ups = up.sum(axis=1)
    ups_counts = np.bincount(total_ups, minlength=n + 1)

    terminal_prices = s0 * u ** total_ups * d ** (n - total_ups)

    running_ups = np.cumsum(up[:N_SAMPLE], axis=1)
    running_ups = np.column_stack([
        np.zeros(len(up[:N_SAMPLE]), dtype=int),
        running_ups
    ])
    step = np.arange(n + 1)
    sample_prices = (
            s0
            * u ** running_ups
            * d ** (step - running_ups)
    )
    # terminal_mean / terminal_std from the terminal prices (decide: ddof=0 or 1?)
    emp_mean = np.mean(terminal_prices)
    emp_std = np.std(terminal_prices,ddof = 0)
    # theoretical mean: s0 * (p*u + (1-p)*d)**n
    # theoretical variance: s0**2 * ((p*u**2 + (1-p)*d**2)**n - (p*u + (1-p)*d)**(2*n))
    mean = s0 * (p*u + (1-p)*d)**n
    std = np.sqrt(max(s0 ** 2 * ((p*u**2 + (1-p)*d**2) ** n - (p*u + (1-p)*d)**(2*n)), 0))

    smp_paths = sample_prices.tolist()
    return SimulationResult(p, smp_paths, ups_counts.tolist(),emp_mean, emp_std, mean, std)

