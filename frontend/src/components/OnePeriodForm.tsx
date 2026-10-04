import type { OnePeriodFormValues, OptionKind } from '../types/pricing'

const FIELDS = [
  ['s0', 'Initial stock price S₀'],
  ['k', 'Strike K'],
  ['u', 'Up factor u'],
  ['d', 'Down factor d'],
  ['r', 'Interest rate r (per period)'],
] as const

type Props = {
  form: OnePeriodFormValues
  setForm: (f: OnePeriodFormValues) => void
  onSubmit: () => void
}

export default function OnePeriodForm({ form, setForm, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      style={{ display: 'grid', gap: 8 }}
    >
      {FIELDS.map(([name, label]) => (
        <label key={name}>
          {label}{' '}
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
        Type{' '}
        <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as OptionKind })}>
          <option value="call">Call</option>
          <option value="put">Put</option>
        </select>
      </label>
      <button type="submit">Price</button>
    </form>
  )
}
