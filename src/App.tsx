import { useEffect, useMemo, useState } from 'react'
import './styles/mindup.css'
import './styles/responsive.css'
import { Splash } from './components/Splash'
import { Login } from './components/Login'
import { BottomNav } from './components/BottomNav'
import { Home } from './components/Home'
import { Attributes } from './components/Attributes'
import { Skills } from './components/Skills'
import { Equipment } from './components/Equipment'
import { Profile } from './components/Profile'
import { Gacha } from './components/Gacha'
import { Settings } from './components/Settings'
import { QuestDetail } from './components/QuestDetail'
import { Mentor } from './components/Mentor'
import { AchievementPopup } from './components/AchievementPopup'
import { PLAYER, QUESTS, type Quest, type Screen } from './utils/data'

function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [dark, setDark] = useState(true)
  const [authLogin, setAuthLogin] = useState(true)
  const [player, setPlayer] = useState(PLAYER)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [popup, setPopup] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('login'), 3000)
    return () => window.clearTimeout(timer)
  }, [])

  const openQuest = (id: string) => {
    const quest = QUESTS[id]
    if (!quest) return
    setSelectedQuest({ ...quest, checklist: quest.checklist ? [...quest.checklist] : undefined })
    setScreen('detail')
  }

  const completeQuest = () => {
    if (!selectedQuest) return
    setPlayer(current => ({ ...current, totalXP: current.totalXP + selectedQuest.xp, xpInLevel: Math.min(current.xpInLevel + selectedQuest.xp, current.xpToNextLevel), completionRate: Math.min(100, current.completionRate + 1) }))
    setSelectedQuest(null)
    setScreen('home')
    setPopup(true)
    window.setTimeout(() => setPopup(false), 3800)
  }

  const activeNav = useMemo(() => ['home', 'attributes', 'mentor', 'equipment', 'profile'].includes(screen) ? screen as Screen : null, [screen])

  return <main className="app-shell"><div className="phone-frame" data-theme={dark ? undefined : 'light'}>
    {screen === 'splash' && <Splash />}
    {screen === 'login' && <Login authLogin={authLogin} onToggleMode={() => setAuthLogin(v => !v)} onEnter={() => setScreen('home')} />}
    {screen === 'home' && <Home player={player} onQuest={openQuest} onMentor={() => setScreen('mentor')} />}
    {screen === 'attributes' && <Attributes player={player} />}
    {screen === 'skills' && <Skills />}
    {screen === 'equipment' && <Equipment />}
    {screen === 'profile' && <Profile player={player} />}
    {screen === 'gacha' && <Gacha />}
    {screen === 'settings' && <Settings dark={dark} onToggleTheme={() => setDark(v => !v)} onSignOut={() => setScreen('login')} />}
    {screen === 'detail' && selectedQuest && <QuestDetail quest={selectedQuest} onBack={() => setScreen('home')} onComplete={completeQuest} />}
    {screen === 'mentor' && <Mentor player={player} onBack={() => setScreen('home')} />}
    {popup && <AchievementPopup />}
    {activeNav && <BottomNav active={activeNav} onNavigate={setScreen} />}
  </div></main>
}
export default App
