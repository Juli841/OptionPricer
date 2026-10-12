import type { BsFormValues } from '../types/blackscholes'
import type { Kind } from '../types/gbm'

type Props = {
  form: BsFormValues
  setForm: (f: BsFormValues) => void
  onSubmit: () => void
}

type NumField = 's0' | 'k' | 'sigma' | 'r' | 'T'

export default function BsForm({ form, setForm, onSubmit }: Props) {
  const num = (name: NumField, label: string, extra = {}) => (
    <label>
      <span>{label}</span>
      <input
        type="number"
        step="any"
        required
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
      <label>
        <span>Option</span>
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as Kind })}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>
      <button type="submit" className="primary">Price</button>
    </form>
  )
}
