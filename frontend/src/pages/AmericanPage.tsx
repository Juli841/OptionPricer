export default function AmericanPage() {
  return (
    <div className="card">
      <h2>American options</h2>
      <p className="note">
        Coming next: at every node the option is worth max(intrinsic value, continuation value), and the tree will
        show the exercise / hold decision. The pricing engine is being written first.
      </p>
    </div>
  )
}
