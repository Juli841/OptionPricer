import type { GbmFormValues, Kind } from '../types/gbm'

type Props = {
  form: GbmFormValues
  setForm: (f: GbmFormValues) => void
  onSubmit: () => void
}

type NumField = 's0' | 'mu' | 'sigma' | 'T' | 'n' | 'paths' | 'seed' | 'k' | 'r'

export default function GbmForm({ form, setForm, onSubmit }: Props) {
  const num = (name: NumField, label: string, extra = {}) => (
    <label>
      <span>{label}</span>
      <input
        type="number"
        step="any"
        required={name !== 'seed'}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        {...extra}
      />
    </label>
  )

  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {num('s0', 'Stock price S₀', { min: 0 })}
      {num('mu', 'Drift μ (per year)')}
      {num('sigma', 'Volatility σ (per year)', { min: 0 })}
      {num('T', 'Maturity T (years)', { min: 0 })}
      {num('n', 'Time steps n', { step: 1, min: 1, max: 1000 })}
      {num('paths', 'Paths', { step: 1, min: 1, max: 100000 })}
      {num('seed', 'Seed (blank = random)', { step: 1 })}
      {num('k', 'Strike K (tree)', { min: 0 })}
      {num('r', 'Rate r (per year, continuous)')}
      <label>
        <span>Option</span>
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>
      <button type="submit" className="primary">Run</button>
    </form>
  )
}
