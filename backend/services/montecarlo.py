"""Step 7: Monte Carlo pricing under the risk-neutral measure.

V0 = e^{-rT} E^Q[payoff(S_T)], estimated by e^{-rT} * mean of payoff over M simulated terminal prices.
Convention as Step 6: T in years, r continuously compounded.
"""
from dataclasses import dataclass

import numpy as np

from backend.services.continuous import Model

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
    # TODO 1: validate: s0 > 0, k > 0, T > 0, 1 <= paths <= MAX_MC_PATHS, kind in call/put (ValueError otherwise)
    if(s0 <= 0 or k <= 0  or T <= 0 or paths < 1 or paths > MAX_MC_PATHS or kind not in ["call", "put"]):
        raise ValueError("Invalid input")
    # TODO 2: rng = np.random.default_rng(seed); ST = terminal prices, shape (paths,)
    rng = np.random.default_rng(seed)
    ST = model.sample(s0, T, 1, paths, rng)[:, -1]
    # TODO 3: discounted payoffs, vectorised: e^{-rT} * max(ST - k, 0)  (or max(k - ST, 0) for a put)
    #         (binomial.payoff works on one float; here use np.maximum on the whole array)
    if(kind == "call"):
        discounts = np.exp(-r*T) * np.maximum(ST - k, 0)
    else:
        discounts = np.exp(-r*T) * np.maximum(k - ST, 0)
    # TODO 4: price = mean; std_error = std(ddof=1) / sqrt(paths)  (ddof=1 is the unbiased sample std;
    #         paths == 1 has no spread -> std_error 0.0 instead of NaN); ci = price +- Z_95 * std_error
    price = np.mean(discounts)
    if(paths == 1):
        return McResult(float(price), 0.0, float(price), float(price), 1, [1], [float(price)], [0.0])
    else:
        std_error = np.std(discounts, ddof = 1) / np.sqrt(paths)
    ci_low = price - Z_95 * std_error
    ci_high = price + Z_95 * std_error
    # TODO 5: convergence: checkpoints = unique(geomspace(10, paths, N_CHECKPOINTS).astype(int)) (clip to paths,
    #         make sure the last one is paths). Running mean at m = cumsum(payoffs)[m-1] / m.
    #         Running std error at m: from cumsum of payoffs and of payoffs**2 (var = E[x^2] - E[x]^2, times m/(m-1)),
    #         no Python loop over m.
    m = np.unique(np.clip(np.geomspace(min(10, paths), paths, N_CHECKPOINTS).astype(int), 2, paths))
    X1 =  np.cumsum(discounts)
    X2 = np.cumsum(discounts ** 2)
    running_mean = X1[m-1] / m
    var = (X2[m - 1] - X1[m - 1] ** 2 / m) / (m - 1)
    running_std = np.sqrt(np.maximum(var, 0) / m)
    return McResult(float(price), float(std_error), float(ci_low), float(ci_high), paths,  m.tolist(), running_mean.tolist(), running_std.tolist())
