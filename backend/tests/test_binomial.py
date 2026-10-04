import pytest

from backend.services.binomial import payoff, price_one_period

S0, K, U, D, R = 100, 100, 1.1, 0.9, 0.05


@pytest.mark.parametrize("kind", ["call", "put"])
def test_replication(kind):
    x = price_one_period(S0, K, U, D, R, kind)
    # the portfolio must reproduce the payoff in BOTH states
    assert x.delta * x.s_up + x.bond * (1 + R) == pytest.approx(x.v_up)
    assert x.delta * x.s_down + x.bond * (1 + R) == pytest.approx(x.v_down)
    # and its cost today is the option price
    assert x.delta * S0 + x.bond == pytest.approx(x.price)


def test_known_values_call():
    x = price_one_period(S0, K, U, D, R, "call")
    assert x.q == pytest.approx(0.75)
    assert x.delta == pytest.approx(0.5)
    assert x.price == pytest.approx(7.142857, abs=1e-6)


def test_put_call_parity():
    c = price_one_period(S0, K, U, D, R, "call").price
    p = price_one_period(S0, K, U, D, R, "put").price
    assert c - p == pytest.approx(S0 - K / (1 + R))


@pytest.mark.parametrize("r", [0.2, -0.2, 0.1, -0.1])  # r=±0.1 hits the boundary
def test_arbitrage_rejected(r):
    with pytest.raises(ValueError):
        price_one_period(S0, K, U, D, r, "call")


def test_payoff_unknown_kind():
    with pytest.raises(ValueError):
        payoff(100, 100, "Call")
