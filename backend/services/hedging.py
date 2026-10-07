"""Step 5: replicate a European option along ONE given path (self-financing portfolio)."""
from dataclasses import dataclass

from backend.services.multi_period import FULL_TREE_MAX_N, price_multi_period
from backend.services.binomial import payoff

@dataclass
class HedgeStep:
    t: int
    stock: float  # S_t on this path
    option: float  # V_t, what the option is worth at this node (from the tree)
    portfolio: float  # X_t, wealth of the replicating portfolio BEFORE rebalancing at t
    delta: float | None  # shares held from t to t+1 (None at expiry)
    cash: float | None  # bond position after rebalancing: X_t - delta * S_t (None at expiry)


@dataclass
class HedgeResult:
    price: float  # V_0 = X_0, the premium the seller receives
    q: float
    steps: list[HedgeStep]  # n + 1 rows, t = 0..n
    payoff: float  # option payoff at expiry on this path
    final_portfolio: float  # X_n, must equal payoff
    max_gap: float  # max over t of |X_t - V_t|, must be ~0 (replication works at EVERY step, not just expiry)


def replicate(
    s0: float, k: float, u: float, d: float, r: float, kind: str, moves: list[bool]
) -> HedgeResult:
    """moves[t] is True if the stock goes UP in step t+1, False if DOWN. n = len(moves)."""
    n = len(moves)
    if not 1 <= n <= FULL_TREE_MAX_N:
        raise ValueError(f"path length must be between 1 and {FULL_TREE_MAX_N}")

    tree = price_multi_period(s0, k, u, d, r, n, kind)

    delta = cash = None
    j = 0
    steps = []
    for t in range(0, n+1):
        stock = tree.stock[t][j]
        option = tree.option[t][j]
        if t == 0:
            x = tree.option[0][0]
        else:
            x = delta * stock + (1+r) * cash
        if(t < n):
            delta = tree.delta[t][j]
            cash = x - delta * stock
        else:
            delta = cash = None

        steps.append(HedgeStep(t=t, stock=stock, option=option, delta=delta, cash=cash, portfolio=x))

        if(t< n and moves[t]):
            j += 1

    pf = payoff(steps[-1].stock, k, kind)
    max_gap = max(abs(s.portfolio - s.option) for s in steps)
    final_portfolio = steps[-1].portfolio
    price = steps[0].portfolio
    q = (1+r-d)/(u-d)
    return HedgeResult(price = price, q = q, steps = steps, payoff = pf,final_portfolio = final_portfolio, max_gap = max_gap)
