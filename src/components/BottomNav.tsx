import type { Screen } from '../utils/data'
type Props={active:Screen;onNavigate:(s:Screen)=>void}
export function BottomNav({active,onNavigate}:Props){const items:[Screen,string,string][]=[['home','⌂','Home'],['attributes','✦','Stats'],['mentor','🧠','Sage'],['equipment','🛡️','Gear'],['profile','♙','Hero']];return <nav className="bnav">{items.map(([id,ico,label])=><button key={id} className={active===id?'ni a':'ni'} onClick={()=>onNavigate(id)}><span>{ico}</span><small>{label}</small><i/></button>)}</nav>}
