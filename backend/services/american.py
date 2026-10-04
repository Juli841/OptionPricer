"""Step 3: N-period binomial tree for American options (early exercise allowed)."""
from dataclasses import dataclass

import numpy as np

from backend.services.binomial import payoff
from backend.services.helpers import trim
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
    delta: list[list[float]] | None  # levels 0..n-1, hedge ratio from the American values
    bond: list[list[float]] | None  # levels 0..n-1, cash held after consuming: V - C - delta*S
    consumption: list[list[float]] | None  # levels 0..n-1, C = V - continuation (>= 0, > 0 only where exercising)


def price_american(
    s0: float, k: float, u: float, d: float, r: float, n: int, kind: str
) -> AmericanResult:
    if not (d < 1 + r < u):
        raise ValueError("Arbitrage detected")
    if n < 1:
        raise ValueError("n must be at least 1")

    q = (1 + r - d) / (u - d)

    l = np.arange(n + 1).reshape(-1, 1)
    j = np.arange(n + 1)

    S = np.where(j <= l, s0 * u**j * d ** (l - j), np.nan)

    V = np.full_like(S, np.nan)
    delta = np.full_like(S, np.nan)
    continuation = np.full_like(S, np.nan)
    intrinsic = np.array([[payoff(S[l, j], k, kind) for j in range(n+1)] for l in range(n+1)])
    V[n] = intrinsic[n]

    for lvl in range(n-1, -1, -1):
        up = slice(1, lvl+2)
        down = slice(0, lvl+1)
        continuation[lvl, :lvl+1] = (q* V[lvl+1, up] + (1-q) * V[lvl+1, down]) / (1+r)
        V[lvl, :lvl+1] = np.maximum(intrinsic[lvl, :lvl+1], continuation[lvl, :lvl+1])


    delta[:n, :n] = (V[1:, 1:] - V[1:, :-1]) / (S[1:, 1:] - S[1:, :-1])
    consumption = V - continuation  # Shreve's C_n: > 0
    bond = continuation - delta * S  # cash held after consuming: V - C - delta*S
    exercise = intrinsic >= continuation  # a tie exercises
    exercise[n] = intrinsic[n] > 0  # expiry: nothing to wait for (continuation is NaN there)

    price = float(V[0, 0])
    if n > FULL_TREE_MAX_N:
        return AmericanResult(price, q, *[None] * 8)

    return AmericanResult(
        price,
        q,
        stock=trim(S, n + 1),
        option=trim(V, n + 1),
        intrinsic=trim(intrinsic, n + 1),
        continuation=trim(continuation, n),  # no continuation at expiry
        exercise=trim(exercise, n + 1),
        delta=trim(delta, n),
        bond=trim(bond, n),
        consumption=trim(consumption, n),
    )
