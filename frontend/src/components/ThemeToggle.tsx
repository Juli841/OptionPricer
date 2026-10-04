export default function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button type="button" className="ghost" onClick={onToggle} aria-label="Toggle dark theme">
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
