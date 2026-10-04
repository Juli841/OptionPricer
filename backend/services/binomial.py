"""Step 1: one-period binomial model. Pure Python, no web code."""
from dataclasses import dataclass


def payoff(s: float, k: float, kind: str) -> float:
    """Option payoff at expiry for stock price s. kind: 'call' | 'put'."""
    if kind == "put":
        return max(k - s, 0)
    elif kind == "call":
        return max(s - k, 0)
    else:
        raise ValueError("unknown option type")


@dataclass
class OnePeriodResult:
    price: float
    delta: float
    bond: float
    q: float
    s_up: float
    s_down: float
    v_up: float
    v_down: float


def price_one_period(s0: float, k: float, u: float, d: float, r: float, kind: str) -> OnePeriodResult:
    if not (d < 1 + r < u):
        raise ValueError("Arbitrage detected")

    # stock prices in both states
    s_up = u * s0
    s_down = d * s0

    # option values in both states
    v_up = payoff(s_up, k, kind)
    v_down = payoff(s_down, k, kind)

    delta = (v_up - v_down) / (s_up - s_down)
    q = (1 + r - d) / (u - d)
    price = (q * v_up + (1 - q) * v_down) / (1 + r)
    bond = price - delta * s0

    return OnePeriodResult(price, delta, bond, q, s_up, s_down, v_up, v_down)
