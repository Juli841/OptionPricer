import { RULES, strength } from '../utils/password'

export default function PasswordMeter({ password }: { password: string }) {
  const { level, label } = strength(password)

  return (
    <div className="pw">
      <div className="pw-bar" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={level} aria-valuetext={label || 'empty'}>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= level ? `on l${level}` : ''} />
        ))}
      </div>
      <p className="pw-label">{label || 'Choose a password'}</p>
      <ul className="pw-rules">
        {RULES.map((r) => (
          <li key={r.label} className={r.test(password) ? 'ok' : ''}>
            {r.test(password) ? '✓' : '○'} {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
