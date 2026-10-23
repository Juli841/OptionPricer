import pytest

from backend.pricing.services.blackscholes import price_bs
from backend.pricing.services.continuous import price_crr
from backend.pricing.services.montecarlo import price_mc  # check its signature before use

S0, K, SIGMA, R, T = 100.0, 100.0, 0.2, 0.05, 1.0


def test_known_value():
    # S0=K=100, sigma=0.2, r=0.05, T=1: call = 10.4506, put = 5.5735 (standard textbook values)
    assert price_bs(S0, K, SIGMA, R, T, "call").price == pytest.approx(10.4506, abs=1e-4)
    assert price_bs(S0, K, SIGMA, R, T, "put").price == pytest.approx(5.5735, abs=1e-4)


def test_put_call_parity():
    # TODO: C - P == S0 - K e^{-rT}, for a few (s0, k, sigma, r, T)
    ...


def test_crr_converges_to_bs():
    # TODO: price_crr with n = 1000 within ~0.01 of price_bs (european, same kind)
    ...


def test_mc_within_confidence_interval():
    # TODO: price_bs inside price_mc's 95% CI (fixed seed, 200k paths)
    ...


def test_bounds_and_invalid_input():
    # TODO: call in [max(S0 - K e^{-rT}, 0), S0]; ValueError on s0<=0, sigma<=0, T<=0, bad kind
    ...
