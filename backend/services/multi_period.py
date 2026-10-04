"""Step 2: N-period recombining binomial tree (European options)."""
from dataclasses import dataclass

import numpy as np

from backend.services.binomial import payoff
from backend.services.helpers import trim

# above this many steps the response carries only the price (trees too big to show)
FULL_TREE_MAX_N = 12


@dataclass
class MultiPeriodResult:
    price: float
    q: float
    # stock[n][j] = stock price at level n after j ups (n+1 entries per level)
    # plain lists (JSON-ready), None when n > FULL_TREE_MAX_N
    stock: list[list[float]] | None
    option: list[list[float]] | None  # same indexing as stock
    delta: list[list[float]] | None  # levels 0..n-1 only (no hedge at expiry)


def price_multi_period(
    s0: float, k: float, u: float, d: float, r: float, n: int, kind: str
) -> MultiPeriodResult:
    if not (d < 1 + r < u):
        raise ValueError("Arbitrage detected")
    if n < 1:
        raise ValueError("n must be at least 1")

    q = (1 + r - d) / (u - d)

    # stock grid: S[l, j] = price after l steps with j ups (nan where j > l)
    l = np.arange(n + 1).reshape(-1, 1)
    j = np.arange(n + 1)
    S = np.where(j <= l, s0 * u**j * d ** (l - j), np.nan)

    # option values: payoff at expiry, then backward induction one level at a time
    V = np.full_like(S, np.nan)
    V[n] = [payoff(s, k, kind) for s in S[n]]
    delta = np.full_like(S, np.nan)
    for lvl in range(n - 1, -1, -1):
        up = slice(1, lvl + 2)  # up children of level lvl
        down = slice(0, lvl + 1)  # down children
        V[lvl, : lvl + 1] = (q * V[lvl + 1, up] + (1 - q) * V[lvl + 1, down]) / (1 + r)
        delta[lvl, : lvl + 1] = (V[lvl + 1, up] - V[lvl + 1, down]) / (
            S[lvl + 1, up] - S[lvl + 1, down]
        )

    price = float(V[0, 0])
    if n > FULL_TREE_MAX_N:
        return MultiPeriodResult(price, q, None, None, None)

    return MultiPeriodResult(price, q, trim(S, n + 1), trim(V, n + 1), trim(delta, n))
