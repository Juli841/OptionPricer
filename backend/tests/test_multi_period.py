import itertools

import pytest

from backend.services.binomial import payoff, price_one_period
from backend.services.multi_period import FULL_TREE_MAX_N, price_multi_period

S0, K, U, D, R = 100, 95, 1.05, 0.97, 0.01


def brute_force(n, kind):
    """Sum over all 2^n paths of q-weighted payoffs, discounted. Slow but obviously right."""
    q = (1 + R - D) / (U - D)
    total = 0
    for path in itertools.product((0, 1), repeat=n):
        j = sum(path)
        total += q**j * (1 - q) ** (n - j) * payoff(S0 * U**j * D ** (n - j), K, kind)
    return total / (1 + R) ** n


@pytest.mark.parametrize("kind", ["call", "put"])
def test_one_step_equals_one_period_engine(kind):
    m = price_multi_period(S0, K, U, D, R, 1, kind)
    o = price_one_period(S0, K, U, D, R, kind)
    assert m.price == pytest.approx(o.price)
    assert m.q == pytest.approx(o.q)
    assert m.delta[0][0] == pytest.approx(o.delta)


def test_hand_checked_two_steps():
    # s0=100 u=1.1 d=0.9 r=0.05 K=100 call: q=0.75, V1=[0, 15], V0=0.75*15/1.05
    m = price_multi_period(100, 100, 1.1, 0.9, 0.05, 2, "call")
    assert m.stock[2] == pytest.approx([81, 99, 121])
    assert m.option[2] == pytest.approx([0, 0, 21])
    assert m.option[1] == pytest.approx([0, 15])
    assert m.price == pytest.approx(10.714286, abs=1e-6)


@pytest.mark.parametrize("n", [1, 2, 5, 10, 12])
@pytest.mark.parametrize("kind", ["call", "put"])
def test_matches_brute_force(n, kind):
    assert price_multi_period(S0, K, U, D, R, n, kind).price == pytest.approx(
        brute_force(n, kind)
    )


@pytest.mark.parametrize("n", [1, 3, 8])
def test_put_call_parity(n):
    c = price_multi_period(S0, K, U, D, R, n, "call").price
    p = price_multi_period(S0, K, U, D, R, n, "put").price
    assert c - p == pytest.approx(S0 - K / (1 + R) ** n)


def test_tree_shapes():
    m = price_multi_period(S0, K, U, D, R, FULL_TREE_MAX_N, "call")
    n = FULL_TREE_MAX_N
    assert [len(row) for row in m.stock] == list(range(1, n + 2))
    assert [len(row) for row in m.option] == list(range(1, n + 2))
    assert [len(row) for row in m.delta] == list(range(1, n + 1))  # no hedge at expiry


def test_large_n_returns_price_only():
    m = price_multi_period(S0, K, U, D, R, FULL_TREE_MAX_N + 1, "call")
    assert m.stock is None and m.option is None and m.delta is None
    assert m.price > 0


@pytest.mark.parametrize(
    "args",
    [
        (S0, K, U, D, 0.2, 3, "call"),  # arbitrage
        (S0, K, U, D, R, 0, "call"),  # n < 1
        (S0, K, U, D, R, 3, "Call"),  # unknown kind
    ],
)
def test_invalid_inputs_rejected(args):
    with pytest.raises(ValueError):
        price_multi_period(*args)
