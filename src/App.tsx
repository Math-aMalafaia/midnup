import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
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
import { getPlayerAttributes, getPlayerProfile } from './services/player'
import { getQuests, completeQuest as completeQuestRemote } from './services/quests'
import type { Quest, Screen } from './utils/data'

type Player = {
  name:string; level:number; rank:string; totalXP:number; xpInLevel:number; xpToNextLevel:number; streakDays:number; completionRate:number;
  attributes:Record<string,{level:number;pct:number}>; equipment:string[]; recentGains:string[]
}

const fallbackPlayer: Player = {name:'Hero',level:1,rank:'Novice',totalXP:0,xpInLevel:0,xpToNextLevel:500,streakDays:0,completionRate:0,attributes:{},equipment:[],recentGains:[]}

function App() {
  const [screen,setScreen]=useState<Screen>('splash')
  const [dark,setDark]=useState(true)
  const [authLogin,setAuthLogin]=useState(true)
  const [player,setPlayer]=useState<Player>(fallbackPlayer)
  const [selectedQuest,setSelectedQuest]=useState<Quest|null>(null)
  const [quests,setQuests]=useState<any[]>([])
  const [popup,setPopup]=useState(false)
  const [booting,setBooting]=useState(true)

  const loadPlayer=async()=>{
    const [profile,attributes]=await Promise.all([getPlayerProfile(),getPlayerAttributes()])
    if(profile){
      const attrs:Player['attributes']={}
      attributes.forEach(a=>{attrs[a.name]={level:a.level,pct:a.percentage}})
      setPlayer({name:profile.username,level:profile.level,rank:profile.rank,totalXP:profile.total_xp,xpInLevel:profile.xp_in_level,xpToNextLevel:profile.xp_to_next_level,streakDays:profile.streak_days,completionRate:Number(profile.completion_rate),attributes:attrs,equipment:[],recentGains:[]})
    }
  }

  const loadQuests=async()=>{try{setQuests(await getQuests())}catch{setQuests([])}}

  useEffect(()=>{const timer=window.setTimeout(async()=>{const {data:{session}}=await supabase.auth.getSession(); if(session){await loadPlayer();await loadQuests();setScreen('home')}else setScreen('login');setBooting(false)},700);return()=>window.clearTimeout(timer)},[])

  const openQuest=(id:string)=>{
    const dbQuest=quests.find(q=>q.slug===id)
    if(dbQuest){setSelectedQuest({id:dbQuest.id.toString(),name:dbQuest.title,icon:dbQuest.icon,category:dbQuest.category,xp:dbQuest.xp_reward,difficulty:dbQuest.difficulty,progress:0,desc:dbQuest.description,heroBg:dbQuest.hero_bg,verify:dbQuest.verification_type,checklist:dbQuest.quest_checklist_items?.sort((a:any,b:any)=>a.position-b.position).map((x:any)=>x.description)})}
    setScreen('detail')
  }

  const completeQuest=async()=>{
    if(!selectedQuest)return
    try{await completeQuestRemote(Number(selectedQuest.id));await loadPlayer();setSelectedQuest(null);setScreen('home');setPopup(true);window.setTimeout(()=>setPopup(false),3800)}catch(err){console.error(err)}
  }

  const activeNav=useMemo(()=>['home','attributes','mentor','equipment','profile'].includes(screen)?screen as Screen:null,[screen])
  if(booting)return <main className="app-shell"><div className="phone-frame"><Splash/></div></main>

  return <main className="app-shell"><div className="phone-frame" data-theme={dark?undefined:'light'}>
    {screen==='splash'&&<Splash/>}
    {screen==='login'&&<Login authLogin={authLogin} onToggleMode={()=>setAuthLogin(v=>!v)} onEnter={async()=>{await loadPlayer();await loadQuests();setScreen('home')}}/>}
    {screen==='home'&&<Home player={player} quests={quests} onQuest={openQuest} onMentor={()=>setScreen('mentor')}/>}
    {screen==='attributes'&&<Attributes player={player}/>}
    {screen==='skills'&&<Skills/>}
    {screen==='equipment'&&<Equipment/>}
    {screen==='profile'&&<Profile player={player}/>}
    {screen==='gacha'&&<Gacha/>}
    {screen==='settings'&&<Settings dark={dark} onToggleTheme={()=>setDark(v=>!v)} onSignOut={async()=>{await supabase.auth.signOut();setScreen('login')}}/>}
    {screen==='detail'&&selectedQuest&&<QuestDetail quest={selectedQuest} onBack={()=>setScreen('home')} onComplete={completeQuest}/>}
    {screen==='mentor'&&<Mentor player={player} onBack={()=>setScreen('home')}/>}
    {popup&&<AchievementPopup/>}
    {activeNav&&<BottomNav active={activeNav} onNavigate={setScreen}/>} 
  </div></main>
}
export default App
