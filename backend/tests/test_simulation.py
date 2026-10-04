import math

import numpy as np
import pytest

from backend.services.simulation import MAX_PATHS, MAX_STEPS, N_SAMPLE, simulate_paths

S0, U, D = 100, 1.1, 0.9


def test_same_seed_reproduces_and_different_seed_differs():
    a = simulate_paths(S0, U, D, 10, 0.5, 500, seed=7)
    assert a == simulate_paths(S0, U, D, 10, 0.5, 500, seed=7)
    assert a != simulate_paths(S0, U, D, 10, 0.5, 500, seed=8)


def test_certain_up_and_certain_down():
    up = simulate_paths(S0, U, D, 5, 1.0, 200, seed=3)
    assert all(path[-1] == pytest.approx(S0 * U**5) for path in up.sample_paths)
    assert up.terminal_mean == pytest.approx(S0 * U**5)
    assert up.theoretical_std == 0
    down = simulate_paths(S0, U, D, 5, 0.0, 200, seed=3)
    assert down.terminal_mean == pytest.approx(S0 * D**5)
    assert down.ups_counts == [200, 0, 0, 0, 0, 0]


def test_shapes():
    n = 10
    r = simulate_paths(S0, U, D, n, 0.5, 1000, seed=1)
    assert len(r.sample_paths) == N_SAMPLE
    assert all(len(path) == n + 1 and path[0] == S0 for path in r.sample_paths)
    assert len(r.ups_counts) == n + 1 and sum(r.ups_counts) == 1000
    assert len(simulate_paths(S0, U, D, n, 0.5, 5, seed=1).sample_paths) == 5  # fewer paths than N_SAMPLE


def test_each_step_is_u_or_d():
    for path in simulate_paths(S0, U, D, 20, 0.5, 100, seed=2).sample_paths:
        for a, b in zip(path, path[1:]):
            assert b / a == pytest.approx(U) or b / a == pytest.approx(D)


def test_mean_and_std_match_theory():
    n, p, paths = 10, 0.6, 100_000
    r = simulate_paths(S0, U, D, n, p, paths, seed=42)
    standard_error = r.theoretical_std / math.sqrt(paths)
    assert abs(r.terminal_mean - r.theoretical_mean) < 4 * standard_error
    assert r.terminal_std == pytest.approx(r.theoretical_std, rel=0.03)
    # also the closed form itself, derived by hand for n=1: Var = S0^2 p (1-p) (u-d)^2
    one = simulate_paths(S0, U, D, 1, 0.3, 10, seed=1)
    assert one.theoretical_std == pytest.approx(S0 * math.sqrt(0.3 * 0.7) * (U - D))


def test_risk_neutral_probability_gives_riskless_growth():
    n, r, paths = 10, 0.05, 100_000
    q = (1 + r - D) / (U - D)
    res = simulate_paths(S0, U, D, n, q, paths, seed=5)
    assert res.theoretical_mean == pytest.approx(S0 * (1 + r) ** n)
    assert abs(res.terminal_mean - res.theoretical_mean) < 4 * res.theoretical_std / math.sqrt(paths)


def test_ups_histogram_is_binomial():
    n, p, paths = 10, 0.6, 100_000
    res = simulate_paths(S0, U, D, n, p, paths, seed=11)
    pmf = [math.comb(n, j) * p**j * (1 - p) ** (n - j) for j in range(n + 1)]
    assert np.max(np.abs(np.array(res.ups_counts) / paths - pmf)) < 0.01


def test_single_path_has_finite_std():
    # a std of one number must not be NaN: NaN cannot be sent as JSON
    assert math.isfinite(simulate_paths(S0, U, D, 3, 0.5, 1, seed=1).terminal_std)


@pytest.mark.parametrize(
    "args",
    [
        (S0, U, D, 0, 0.5, 10),  # n < 1
        (S0, U, D, MAX_STEPS + 1, 0.5, 10),
        (S0, U, D, 10, 0.5, 0),  # paths < 1
        (S0, U, D, 10, 0.5, MAX_PATHS + 1),
        (S0, U, D, 1000, 0.5, 100_000),  # too many draws
        (S0, U, D, 10, -0.1, 10),  # p outside [0, 1]
        (S0, U, D, 10, 1.1, 10),
    ],
)
def test_invalid_inputs_rejected(args):
    with pytest.raises(ValueError):
        simulate_paths(*args)
