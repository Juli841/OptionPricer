import pytest

from backend.services.american import price_american
from backend.services.multi_period import FULL_TREE_MAX_N, price_multi_period

# (s0, k, u, d, r, n): a spread of shapes, one with a negative rate
CASES = [
    (100, 100, 1.1, 0.9, 0.05, 3),
    (100, 95, 1.05, 0.97, 0.01, 8),
    (100, 120, 1.2, 0.8, 0.02, 12),
    (100, 100, 1.1, 0.9, -0.02, 5),
]


@pytest.mark.parametrize("kind", ["call", "put"])
@pytest.mark.parametrize("s0,k,u,d,r,n", CASES)
def test_replication_with_consumption(kind, s0, k, u, d, r, n):
    """Shreve: X' = delta*S' + (1+r)*(X - C - delta*S) must hit V' in both states."""
    a = price_american(s0, k, u, d, r, n, kind)
    for lvl in range(n):
        for j in range(lvl + 1):
            for up in (0, 1):
                portfolio = a.delta[lvl][j] * a.stock[lvl + 1][j + up] + (1 + r) * a.bond[lvl][j]
                assert portfolio == pytest.approx(a.option[lvl + 1][j + up], abs=1e-9)
            assert a.option[lvl][j] == pytest.approx(a.continuation[lvl][j] + a.consumption[lvl][j])
            assert a.consumption[lvl][j] >= -1e-12


@pytest.mark.parametrize("kind", ["call", "put"])
@pytest.mark.parametrize("s0,k,u,d,r,n", CASES)
def test_value_never_below_intrinsic_or_european(kind, s0, k, u, d, r, n):
    a = price_american(s0, k, u, d, r, n, kind)
    e = price_multi_period(s0, k, u, d, r, n, kind)
    assert a.price >= e.price - 1e-12
    for lvl in range(n + 1):
        for j in range(lvl + 1):
            assert a.option[lvl][j] >= a.intrinsic[lvl][j] - 1e-12


@pytest.mark.parametrize("s0,k,u,d,r,n", [c for c in CASES if c[4] >= 0])
def test_american_call_equals_european_call(s0, k, u, d, r, n):
    # no dividends and r >= 0: never optimal to exercise a call early
    a = price_american(s0, k, u, d, r, n, "call").price
    assert a == pytest.approx(price_multi_period(s0, k, u, d, r, n, "call").price)


def test_early_exercise_premium_for_put():
    # hand-checked: n=2 put, K=100, u=1.1, d=0.9, r=0.05
    a = price_american(100, 100, 1.1, 0.9, 0.05, 2, "put")
    assert a.price == pytest.approx(2.551020, abs=1e-6)
    assert a.price > price_multi_period(100, 100, 1.1, 0.9, 0.05, 2, "put").price + 1
    assert a.exercise == [[False], [True, False], [True, True, False]]


def test_tree_shapes_and_large_n():
    n = FULL_TREE_MAX_N
    a = price_american(100, 100, 1.01, 0.99, 0.005, n, "put")
    assert [len(x) for x in a.stock] == list(range(1, n + 2))
    assert [len(x) for x in a.exercise] == list(range(1, n + 2))
    for tree in (a.continuation, a.delta, a.bond, a.consumption):
        assert [len(x) for x in tree] == list(range(1, n + 1))  # no hedge at expiry
    big = price_american(100, 100, 1.01, 0.99, 0.005, n + 1, "put")
    assert big.stock is None and big.exercise is None and big.bond is None
    assert big.price > 0


@pytest.mark.parametrize(
    "args",
    [
        (100, 100, 1.1, 0.9, 0.2, 3, "put"),  # arbitrage
        (100, 100, 1.1, 0.9, 0.05, 0, "put"),  # n < 1
        (100, 100, 1.1, 0.9, 0.05, 3, "Put"),  # unknown kind
    ],
)
def test_invalid_inputs_rejected(args):
    with pytest.raises(ValueError):
        price_american(*args)
