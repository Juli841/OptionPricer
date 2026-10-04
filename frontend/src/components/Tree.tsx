const R = 32 // node radius
const DX = 116 // horizontal distance between levels
const DY = 72 // vertical distance between neighbouring nodes
const PAD = 16

const f = (x: number) => x.toFixed(2)

type Props = {
  stock: number[][]
  option: number[][]
  delta: number[][]
}

export default function Tree({ stock, option, delta }: Props) {
  const n = stock.length - 1
  const width = n * DX + 2 * R + 2 * PAD
  const height = n * DY + 2 * R + 2 * PAD
  // level l, j ups -> centre of node; up-moves go towards the top
  const cx = (l: number) => PAD + R + l * DX
  const cy = (l: number, j: number) => height / 2 + (l / 2 - j) * DY

  // colour = option value vs the premium paid today (V0): red below, amber equal, green above.
  // each side is scaled on its own so a lopsided tree still uses the full red..green range
  const v0 = option[0][0]
  const all = option.flat()
  const up = Math.max(Math.max(...all) - v0, 1e-9)
  const down = Math.max(v0 - Math.min(...all), 1e-9)
  const fill = (v: number) => `hsl(${60 + (v >= v0 ? 60 * ((v - v0) / up) : -60 * ((v0 - v) / down))} 65% var(--node-l))`

  const edges: { x1: number; y1: number; x2: number; y2: number; up: boolean; key: string }[] = []
  for (let l = 0; l < n; l++) {
    for (let j = 0; j <= l; j++) {
      edges.push({ key: `u${l}-${j}`, up: true, x1: cx(l), y1: cy(l, j), x2: cx(l + 1), y2: cy(l + 1, j + 1) })
      edges.push({ key: `d${l}-${j}`, up: false, x1: cx(l), y1: cy(l, j), x2: cx(l + 1), y2: cy(l + 1, j) })
    }
  }

  return (
    <div className="tree-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Binomial tree">
        {edges.map((e) => (
          <line key={e.key} className={e.up ? 'edge-up' : 'edge-down'} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
        ))}
        {stock.map((row, l) =>
          row.map((s, j) => {
            const v = option[l][j]
            const d = delta[l]?.[j]
            return (
              <g key={`${l}-${j}`} className="node">
                <title>
                  {`step ${l}, ${j} up\nS = ${f(s)}\nV = ${f(v)}${d === undefined ? '' : `\nΔ = ${d.toFixed(4)}`}`}
                </title>
                <circle cx={cx(l)} cy={cy(l, j)} r={R} style={{ fill: fill(v) }} />
                <text className="s" x={cx(l)} y={cy(l, j) - 3} textAnchor="middle">S {f(s)}</text>
                <text className="v" x={cx(l)} y={cy(l, j) + 13} textAnchor="middle">V {f(v)}</text>
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}
