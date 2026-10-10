import type { Kind } from '../types/gbm'
import type { McFormValues } from '../types/montecarlo'

type Props = {
  form: McFormValues
  setForm: (f: McFormValues) => void
  onSubmit: () => void
}

type NumField = 's0' | 'k' | 'sigma' | 'r' | 'T' | 'paths' | 'seed'

export default function McForm({ form, setForm, onSubmit }: Props) {
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
      {num('k', 'Strike K', { min: 0 })}
      {num('sigma', 'Volatility σ (per year)', { min: 0 })}
      {num('r', 'Rate r (per year, continuous)')}
      {num('T', 'Maturity T (years)', { min: 0 })}
      {num('paths', 'Simulations M', { step: 1, min: 1, max: 1000000 })}
      {num('seed', 'Seed (blank = random)', { step: 1 })}
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
