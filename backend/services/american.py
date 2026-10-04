"""Step 3: N-period binomial tree for American options (early exercise allowed)."""
from dataclasses import dataclass

import numpy as np

from backend.services.binomial import payoff
from backend.services.multi_period import FULL_TREE_MAX_N


@dataclass
class AmericanResult:
    price: float
    q: float
    # all trees indexed [level][ups], plain lists, None when n > FULL_TREE_MAX_N
    stock: list[list[float]] | None
    option: list[list[float]] | None  # value = max(intrinsic, continuation)
    intrinsic: list[list[float]] | None  # payoff if exercised right now
    continuation: list[list[float]] | None  # levels 0..n-1 only (expiry has nothing to wait for)
    exercise: list[list[bool]] | None  # True where exercising now is optimal (levels 0..n)


def price_american(
    s0: float, k: float, u: float, d: float, r: float, n: int, kind: str
) -> AmericanResult:
    # TODO: same validation as price_multi_period (arbitrage, n < 1) and the same q
    # TODO: stock grid S[l, j] (same as multi_period)
    # TODO: intrinsic grid: payoff(S[l, j]) for EVERY node, not only at expiry
    # TODO: V grid: V[n] = intrinsic[n]
    # TODO: backward loop, level n-1 down to 0:
    #       continuation[l, :l+1] = (q * V[l+1, up] + (1 - q) * V[l+1, down]) / (1 + r)
    #       V[l, :l+1]            = np.maximum(intrinsic[l, :l+1], continuation[l, :l+1])
    # TODO: exercise decision: intrinsic >= continuation (think: what should a tie do? and at expiry?)
    # TODO: price = float(V[0, 0]); trim rows to l+1 entries + .tolist() only if n <= FULL_TREE_MAX_N
