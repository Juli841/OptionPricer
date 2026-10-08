import math

import numpy as np
import pytest

from backend.services.continuous import (
    MAX_STEPS, N_BINS, BinomialModel, GBM, crr_params, price_crr, simulate_gbm,
)
from backend.services.multi_period import price_multi_period
from backend.services.simulation import N_SAMPLE

S0, MU, SIGMA, T = 100.0, 0.1, 0.2, 1.0


def test_shapes_and_start():
    r = simulate_gbm(S0, MU, SIGMA, T, 20, 1000, seed=1)
    assert len(r.times) == 21 and r.times[0] == 0 and r.times[-1] == T
    assert len(r.sample_paths) == N_SAMPLE
    assert all(len(p) == 21 and p[0] == S0 for p in r.sample_paths)
    assert len(r.log_return_counts) == N_BINS and len(r.log_return_edges) == N_BINS + 1
    assert sum(r.log_return_counts) == 1000


def test_same_seed_reproduces():
    a = simulate_gbm(S0, MU, SIGMA, T, 20, 500, seed=7)
    assert a == simulate_gbm(S0, MU, SIGMA, T, 20, 500, seed=7)
    assert a != simulate_gbm(S0, MU, SIGMA, T, 20, 500, seed=8)


def test_terminal_moments_match_closed_forms():
    r = simulate_gbm(S0, MU, SIGMA, T, 50, 100_000, seed=3)
    assert r.theoretical_mean == pytest.approx(S0 * math.exp(MU * T))
    se = r.theoretical_std / math.sqrt(100_000)
    assert abs(r.terminal_mean - r.theoretical_mean) < 4 * se
    assert r.terminal_std == pytest.approx(r.theoretical_std, rel=0.03)
    assert r.theoretical_log_return_mean == pytest.approx((MU - SIGMA**2 / 2) * T)
    assert r.log_return_mean == pytest.approx(r.theoretical_log_return_mean, abs=0.005)
    assert r.log_return_std == pytest.approx(SIGMA * math.sqrt(T), rel=0.01)


def test_step_count_does_not_change_the_terminal_law():
    # exact GBM steps: 1 step and 100 steps have the same distribution of S_T
    a = simulate_gbm(S0, MU, SIGMA, T, 1, 100_000, seed=1)
    b = simulate_gbm(S0, MU, SIGMA, T, 100, 100_000, seed=2)
    assert a.log_return_mean == pytest.approx(b.log_return_mean, abs=0.01)
    assert a.log_return_std == pytest.approx(b.log_return_std, rel=0.02)


@pytest.mark.parametrize("kw", [
    dict(s0=0), dict(sigma=0), dict(T=0), dict(n=0), dict(n=MAX_STEPS + 1),
    dict(paths=0), dict(paths=10**6), dict(n=1000, paths=100_000),
])
def test_simulate_rejects_bad_inputs(kw):
    args = dict(s0=S0, mu=MU, sigma=SIGMA, T=T, n=10, paths=100, seed=1) | kw
    with pytest.raises(ValueError):
        simulate_gbm(**args)


def test_models_return_paths_array():
    rng = np.random.default_rng(0)
    for model in (GBM(MU, SIGMA), BinomialModel(1.1, 0.9, 0.5)):
        S = model.sample(S0, T, 12, 50, rng)
        assert S.shape == (50, 13) and (S[:, 0] == S0).all() and (S > 0).all()


def test_binomial_model_mean():
    S = BinomialModel(1.1, 0.9, 0.6).sample(S0, 1, 10, 100_000, np.random.default_rng(5))
    assert S[:, -1].mean() == pytest.approx(S0 * (0.6 * 1.1 + 0.4 * 0.9) ** 10, rel=0.01)


def test_crr_params():
    p = crr_params(0.2, 0.05, 1.0, 100)
    dt = 0.01
    assert p.u == pytest.approx(math.exp(0.2 * math.sqrt(dt))) and p.d == pytest.approx(1 / p.u)
    assert p.r_step == pytest.approx(math.exp(0.05 * dt) - 1)
    assert 0 < p.q < 1 and p.q == pytest.approx((1 + p.r_step - p.d) / (p.u - p.d))


def test_crr_rejects_arbitrage_and_bad_inputs():
    with pytest.raises(ValueError, match="Arbitrage"):
        crr_params(0.01, 0.5, 1.0, 1)  # drift beats volatility on a coarse tree
    for args in [(0, 0.05, 1, 10), (0.2, 0.05, 0, 10), (0.2, 0.05, 1, 0)]:
        with pytest.raises(ValueError):
            crr_params(*args)


def test_negative_rate_is_allowed():
    assert crr_params(0.2, -0.01, 1.0, 50).q < 0.5


def test_price_crr_is_the_existing_tree():
    p = crr_params(0.2, 0.05, 1.0, 10)
    a = price_crr(S0, 100, 0.2, 0.05, 1.0, 10, "call")
    b = price_multi_period(S0, 100, p.u, p.d, p.r_step, 10, "call")
    assert a == b


def bs_call(s, k, sigma, r, t):
    d1 = (math.log(s / k) + (r + sigma**2 / 2) * t) / (sigma * math.sqrt(t))
    d2 = d1 - sigma * math.sqrt(t)
    cdf = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
    return s * cdf(d1) - k * math.exp(-r * t) * cdf(d2)


def test_crr_converges_to_black_scholes():
    # Black-Scholes is Step 8; used here only as an independent limit to check against
    ref = bs_call(S0, 100, 0.2, 0.05, 1.0)
    errs = [abs(price_crr(S0, 100, 0.2, 0.05, 1.0, n, "call").price - ref) for n in (25, 100, 400, 1000)]
    assert errs[-1] < 0.01 and errs[-1] < errs[0]


def test_crr_put_call_parity_with_continuous_rate():
    n, r, t, k = 200, 0.05, 1.0, 105
    c = price_crr(S0, k, 0.2, r, t, n, "call").price
    pu = price_crr(S0, k, 0.2, r, t, n, "put").price
    assert c - pu == pytest.approx(S0 - k * math.exp(-r * t), abs=1e-6)
