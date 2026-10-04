import type { OptionKind, PricingFormValues } from '../types/pricing'

const FIELDS = [
  ['s0', 'Stock price S₀'],
  ['k', 'Strike K'],
  ['u', 'Up factor u'],
  ['d', 'Down factor d'],
  ['r', 'Rate r (per step)'],
] as const

type Props = {
  form: PricingFormValues
  setForm: (f: PricingFormValues) => void
  onSubmit: () => void
}

export default function PricingForm({ form, setForm, onSubmit }: Props) {
  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {FIELDS.map(([name, label]) => (
        <label key={name}>
          <span>{label}</span>
          <input
            type="number"
            step="any"
            required
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          />
        </label>
      ))}
      <label>
        <span>Steps n</span>
        <input
          type="number"
          step={1}
          min={1}
          max={1000}
          required
          value={form.n}
          onChange={(e) => setForm({ ...form, n: e.target.value })}
        />
      </label>
      <label>
        <span>Type</span>
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as OptionKind })}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>
      <button type="submit" className="primary">Price</button>
    </form>
  )
}
