import type { OnePeriodResult } from '../types/pricing'

const f = (n: number) => n.toFixed(2)

function Node({ x, y, s, v, label }: { x: number; y: number; s: number; v: number; label: string }) {
  return (
    <g>
      <rect x={x - 60} y={y - 28} width={120} height={56} rx={6} fill="none" stroke="currentColor" />
      <text x={x} y={y - 6} textAnchor="middle" fontSize={13}>{label} S = {f(s)}</text>
      <text x={x} y={y + 14} textAnchor="middle" fontSize={13}>V = {f(v)}</text>
    </g>
  )
}

export default function Tree({ s0, res }: { s0: number; res: OnePeriodResult }) {
  return (
    <svg viewBox="0 0 400 200" width="100%" style={{ maxWidth: 480 }}>
      <line x1={120} y1={100} x2={280} y2={45} stroke="currentColor" />
      <line x1={120} y1={100} x2={280} y2={155} stroke="currentColor" />
      <text x={185} y={60} fontSize={12}>q = {res.q.toFixed(3)}</text>
      <text x={170} y={150} fontSize={12}>1 − q = {(1 - res.q).toFixed(3)}</text>
      <Node x={60} y={100} s={s0} v={res.price} label="t=0" />
      <Node x={340} y={40} s={res.s_up} v={res.v_up} label="up" />
      <Node x={340} y={160} s={res.s_down} v={res.v_down} label="down" />
    </svg>
  )
}
