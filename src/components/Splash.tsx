export function Splash() {
  const particles = Array.from({ length: 18 })
  return <section className="sc splash">{particles.map((_, i) => <i className="prt" key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 8) * .45}s` }} />)}<div className="sp-wrap"><div className="sp-logo">🧠</div><h1 className="sp-title">Mind<span>Up</span></h1><p className="sp-tag">Level up your life</p><div className="sp-bar"><div className="sp-fill" /></div></div></section>
}