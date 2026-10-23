// the photo, or the first letter of the name when there is none
export default function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {src ? <img src={src} alt="" /> : name.charAt(0).toUpperCase()}
    </span>
  )
}
