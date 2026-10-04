// P(J = j) for J ~ Binomial(n, p), j = 0..n; log-space so n up to 1000 does not overflow
export function binomialPmf(n: number, p: number): number[] {
  if (p <= 0) return Array.from({ length: n + 1 }, (_, j) => (j === 0 ? 1 : 0))
  if (p >= 1) return Array.from({ length: n + 1 }, (_, j) => (j === n ? 1 : 0))
  const logFact = [0]
  for (let i = 1; i <= n; i++) logFact.push(logFact[i - 1] + Math.log(i))
  return logFact.map((_, j) =>
    Math.exp(logFact[n] - logFact[j] - logFact[n - j] + j * Math.log(p) + (n - j) * Math.log(1 - p)),
  )
}
