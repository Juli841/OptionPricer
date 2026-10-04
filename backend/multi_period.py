"""Step 2: N-period recombining binomial tree (European options)."""
from dataclasses import dataclass

import numpy as np

from backend.binomial import payoff

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
    delta: list[list[float]] | None   # levels 0..n-1 only (no hedge at expiry)


def price_multi_period(
    s0: float, k: float, u: float, d: float, r: float, n: int, kind: str
) -> MultiPeriodResult:
    # TODO: reject arbitrage (d < 1+r < u) and n < 1
    # TODO: q once (it is the same at every node)
    # TODO: stock levels as 1D arrays: j = np.arange(l + 1); S_l = s0 * u**j * d**(l - j)
    #       (build all levels 0..n, keep them in a list)
    # TODO: option value at expiry: payoff of each stock price at level n (np.array of n+1)
    # TODO: backward induction, level n-1 down to 0, two shifted slices, no inner loop:
    #       V_l     = (q * V_next[1:] + (1 - q) * V_next[:-1]) / (1 + r)
    #       delta_l = (V_next[1:] - V_next[:-1]) / (S_next[1:] - S_next[:-1])
    # TODO: price = V_0[0]; convert arrays with .tolist() (and float() for the price)
    #       return trees only if n <= FULL_TREE_MAX_N, else None
