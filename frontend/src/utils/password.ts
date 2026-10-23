// keep in sync with the password validator in backend/schemas/auth.py
export const RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'A symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export const meetsRules = (p: string) => RULES.every((r) => r.test(p))

// 0 = empty, 1 weak, 2 fair, 3 good (all rules), 4 strong (all rules and 12+ characters)
export function strength(p: string): { level: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!p) return { level: 0, label: '' }
  if (meetsRules(p)) return p.length >= 12 ? { level: 4, label: 'Strong' } : { level: 3, label: 'Good' }
  const passed = RULES.filter((r) => r.test(p)).length
  return passed >= 3 ? { level: 2, label: 'Fair' } : { level: 1, label: 'Weak' }
}
