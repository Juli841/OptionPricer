"""Step 7: Monte Carlo pricing under the risk-neutral measure.

V0 = e^{-rT} E^Q[payoff(S_T)], estimated by e^{-rT} * mean of payoff over M simulated terminal prices.
Convention as Step 6: T in years, r continuously compounded.
"""
from dataclasses import dataclass

import numpy as np

from backend.pricing.services.continuous import Model

MAX_MC_PATHS = 1_000_000  # one draw per path (terminal price only), so this is cheap
N_CHECKPOINTS = 60  # points on the convergence plot
Z_95 = 1.96


@dataclass
class McResult:
    price: float  # discounted sample mean of the payoff
    std_error: float  # sample std of the discounted payoffs / sqrt(M)
    ci_low: float  # price - 1.96 * std_error
    ci_high: float  # price + 1.96 * std_error
    paths: int  # M
    checkpoints: list[int]  # N_CHECKPOINTS path counts m, log-spaced from ~10 to M, last one == M
    running_price: list[float]  # price estimated from the first m paths, for each checkpoint
    running_std_error: list[float]  # std error from the first m paths, for each checkpoint


def price_mc(
    model: Model, s0: float, k: float, r: float, T: float, paths: int, kind: str, seed: int | None = None
) -> McResult:
    """European option price by Monte Carlo. `model` must already be risk-neutral (GBM drift = r).

    Take terminal prices from model.sample(s0, T, 1, paths, rng)[:, -1]  (one step is exact for GBM).
    """
    if(s0 <= 0 or k <= 0  or T <= 0 or paths < 1 or paths > MAX_MC_PATHS or kind not in ["call", "put"]):
        raise ValueError("Invalid input")
    rng = np.random.default_rng(seed)
    ST = model.sample(s0, T, 1, paths, rng)[:, -1]
    if(kind == "call"):
        discounts = np.exp(-r*T) * np.maximum(ST - k, 0)
    else:
        discounts = np.exp(-r*T) * np.maximum(k - ST, 0)
    price = np.mean(discounts)
    if(paths == 1):
        return McResult(float(price), 0.0, float(price), float(price), 1, [1], [float(price)], [0.0])
    else:
        std_error = np.std(discounts, ddof = 1) / np.sqrt(paths)
    ci_low = price - Z_95 * std_error
    ci_high = price + Z_95 * std_error
    m = np.unique(np.clip(np.geomspace(min(10, paths), paths, N_CHECKPOINTS).astype(int), 2, paths))
    X1 =  np.cumsum(discounts)
    X2 = np.cumsum(discounts ** 2)
    running_mean = X1[m-1] / m
    var = (X2[m - 1] - X1[m - 1] ** 2 / m) / (m - 1)
    running_std = np.sqrt(np.maximum(var, 0) / m)
    return McResult(float(price), float(std_error), float(ci_low), float(ci_high), paths,  m.tolist(), running_mean.tolist(), running_std.tolist())
