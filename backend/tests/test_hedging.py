import itertools

import pytest

from backend.services.hedging import replicate
from backend.services.multi_period import price_multi_period

S0, K, U, D, R = 100, 100, 1.1, 0.9, 0.05


@pytest.mark.parametrize("kind", ["call", "put"])
def test_replication_on_every_path(kind):
    # the whole point of step 5: whatever the path, the portfolio ends exactly at the payoff
    n = 6
    for moves in itertools.product([True, False], repeat=n):
        res = replicate(S0, K, U, D, R, kind, list(moves))
        assert res.final_portfolio == pytest.approx(res.payoff, abs=1e-9)
        assert res.max_gap < 1e-9  # and it matches the option value at every step


def test_starts_at_the_premium():
    res = replicate(S0, K, U, D, R, "call", [True, False, True])
    assert res.steps[0].portfolio == pytest.approx(price_multi_period(S0, K, U, D, R, 3, "call").price)
    assert len(res.steps) == 4
    assert res.steps[-1].delta is None and res.steps[-1].cash is None


def test_cash_is_wealth_minus_shares():
    for step in replicate(S0, K, U, D, R, "put", [False, False, True, True]).steps[:-1]:
        assert step.cash == pytest.approx(step.portfolio - step.delta * step.stock)


def test_bad_path_length_and_arbitrage():
    with pytest.raises(ValueError):
        replicate(S0, K, U, D, R, "call", [])
    with pytest.raises(ValueError):
        replicate(S0, K, U, D, R, "call", [True] * 13)
    with pytest.raises(ValueError):
        replicate(S0, K, U, D, 0.5, "call", [True])  # 1 + r > u
