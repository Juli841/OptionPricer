import type { Measure, SimulationFormValues } from '../types/simulation'

type Props = {
  form: SimulationFormValues
  setForm: (f: SimulationFormValues) => void
  onSubmit: () => void
}

export default function SimulationForm({ form, setForm, onSubmit }: Props) {
  const num = (name: 'u' | 'd' | 's0' | 'p' | 'r', label: string, extra = {}) => (
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
      {num('s0', 'Stock price S₀')}
      {num('u', 'Up factor u')}
      {num('d', 'Down factor d')}
      <label>
        <span>Steps n</span>
        <input
          type="number" step={1} min={1} max={1000} required
          value={form.n}
          onChange={(e) => setForm({ ...form, n: e.target.value })}
        />
      </label>
      <label>
        <span>Paths</span>
        <input
          type="number" step={1} min={1} max={100000} required
          value={form.paths}
          onChange={(e) => setForm({ ...form, paths: e.target.value })}
        />
      </label>
      <label>
        <span>Probability</span>
        <select value={form.measure} onChange={(e) => setForm({ ...form, measure: e.target.value as Measure })}>
          <option value="real_world">Real-world p</option>
          <option value="risk_neutral">Risk-neutral q</option>
        </select>
      </label>
      {form.measure === 'real_world'
        ? num('p', 'Up probability p', { min: 0, max: 1 })
        : num('r', 'Rate r (per step), gives q')}
      <label>
        <span>Seed (blank = random)</span>
        <input
          type="number" step={1}
          value={form.seed}
          onChange={(e) => setForm({ ...form, seed: e.target.value })}
        />
      </label>
      <button type="submit" className="primary">Simulate</button>
    </form>
  )
}
