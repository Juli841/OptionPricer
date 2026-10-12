"""Step 8: Black-Scholes closed form (Greeks are Step 9).

Convention (same as Step 6/7): T in years, sigma / r annualised, r continuously compounded.
No dividends.
"""
from dataclasses import dataclass
from math import exp, log, sqrt

import numpy as np
from scipy.stats import norm  # norm.cdf = N(x), norm.pdf = n(x)


@dataclass
class BsResult:
    price: float
    d1: float
    d2: float
    nd1: float  # N(d1) for a call: the delta (limit of the binomial hedge ratio)
    nd2: float  # N(d2): risk-neutral probability of finishing in the money


def price_bs(s0: float, k: float, sigma: float, r: float, T: float, kind: str) -> BsResult:
    """Black-Scholes price for a European call or put.

    d1 = [ln(S0/K) + (r + sigma^2/2) T] / (sigma sqrt(T)),  d2 = d1 - sigma sqrt(T)
    call = S0 N(d1) - K e^{-rT} N(d2)
    put  = K e^{-rT} N(-d2) - S0 N(-d1)

    """
    if(s0 <= 0 or k <=0 or T <= 0 or sigma <= 0 or kind not in ['call', 'put']):
        raise ValueError("Invalid input")
    d1 = (np.log(s0/k) + (r + sigma ** 2/2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if(kind == 'call'):
        price = s0 * norm.cdf(d1) - k * norm.cdf(d2) * np.exp(-r * T)
    else:
        price = k * np.exp(-r * T) * norm.cdf(-d2) - s0 * norm.cdf(-d1)
    return BsResult(price, d1, d2, norm.cdf(d1), norm.cdf(d2))
