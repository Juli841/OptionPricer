import math

import numpy as np
import pytest

from backend.services.continuous import GBM, price_crr
from backend.services.montecarlo import N_CHECKPOINTS, price_mc

S0, K, SIGMA, R, T = 100.0, 100.0, 0.2, 0.05, 1.0
MODEL = GBM(R, SIGMA)  # risk-neutral: drift = r


def mc(kind="call", paths=200_000, seed=1, k=K):
    return price_mc(MODEL, S0, k, R, T, paths, kind, seed)


@pytest.mark.parametrize("kind", ["call", "put"])
def test_agrees_with_crr_tree(kind):
    # independent check: a fine CRR tree is a different method for the same number
    ref = price_crr(S0, K, SIGMA, R, T, 1000, kind).price
    res = mc(kind)
    assert abs(res.price - ref) < 4 * res.std_error


def test_ci_and_std_error_are_consistent():
    res = mc(paths=50_000)
    assert res.std_error > 0
    assert res.ci_low == pytest.approx(res.price - 1.96 * res.std_error)
    assert res.ci_high == pytest.approx(res.price + 1.96 * res.std_error)
    assert res.paths == 50_000


def test_std_error_shrinks_like_one_over_sqrt_m():
    small, big = mc(paths=10_000), mc(paths=1_000_000, seed=2)
    assert small.std_error / big.std_error == pytest.approx(10, rel=0.15)


def test_ci_covers_the_true_price_most_of_the_time():
    ref = price_crr(S0, K, SIGMA, R, T, 1000, "call").price
    hits = sum(
        (r := mc(paths=5_000, seed=s)).ci_low <= ref <= r.ci_high for s in range(100)
    )
    assert hits >= 88  # nominal 95; slack for tree error and bad luck


def test_put_call_parity():
    # same seed -> same terminal prices, so parity holds up to rounding
    c, p = mc("call", seed=5), mc("put", seed=5)
    assert c.price - p.price == pytest.approx(S0 - K * math.exp(-R * T), abs=1e-6 + 3 * c.std_error)


def test_convergence_series():
    res = mc(paths=20_000)
    assert len(res.checkpoints) == len(res.running_price) == len(res.running_std_error) <= N_CHECKPOINTS
    assert res.checkpoints == sorted(set(res.checkpoints)) and res.checkpoints[-1] == 20_000
    assert res.running_price[-1] == pytest.approx(res.price)
    assert res.running_std_error[-1] == pytest.approx(res.std_error)
    assert res.running_std_error[0] > res.running_std_error[-1]


def test_same_seed_reproduces_and_single_path_is_finite():
    assert mc(paths=1000, seed=3) == mc(paths=1000, seed=3)
    one = mc(paths=1)
    assert np.isfinite(one.price) and one.std_error == 0


def test_bad_inputs():
    for kw in (dict(paths=0), dict(k=-1.0)):
        with pytest.raises(ValueError):
            mc(**kw)
    with pytest.raises(ValueError):
        price_mc(MODEL, S0, K, R, T, 100, "straddle")
