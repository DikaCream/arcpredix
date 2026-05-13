export default function BottomNav({ active, setActive }) {
  const items = [
    { id:"MARKETS",   label:"Markets",   icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    )},
    { id:"AGENTS",    label:"Agents",    icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    )},
    { id:"PORTFOLIO", label:"Portfolio", icon:(
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="nav-icon">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    )},
  ]
  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={"nav-item"+(active===item.id?" active":"")}
          onClick={() => setActive(item.id)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
