import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabase'
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

type Player = {name:string;level:number;rank:string;totalXP:number;xpInLevel:number;xpToNextLevel:number;streakDays:number;completionRate:number;attributes:Record<string,{level:number;pct:number}>;equipment:string[];recentGains:string[]}
const fallbackPlayer: Player = {name:'Hero',level:1,rank:'Novice',totalXP:0,xpInLevel:0,xpToNextLevel:500,streakDays:0,completionRate:0,attributes:{},equipment:[],recentGains:[]}

function App(){
 const [screen,setScreen]=useState<Screen>('splash'),[dark,setDark]=useState(true),[authLogin,setAuthLogin]=useState(true),[player,setPlayer]=useState<Player>(fallbackPlayer),[selectedQuest,setSelectedQuest]=useState<Quest|null>(null),[quests,setQuests]=useState<any[]>([]),[popup,setPopup]=useState(false),[booting,setBooting]=useState(true),[bootError,setBootError]=useState('')
 const loadPlayer=async()=>{const [profile,attributes]=await Promise.all([getPlayerProfile(),getPlayerAttributes()]);if(!profile)throw new Error('Perfil não encontrado. Execute 001_mindup.sql e 002_gameplay.sql no Supabase.');const attrs:Player['attributes']={};attributes.forEach(a=>{attrs[a.name]={level:a.level,pct:a.percentage}});setPlayer({name:profile.username,level:profile.level,rank:profile.rank,totalXP:profile.total_xp,xpInLevel:profile.xp_in_level,xpToNextLevel:profile.xp_to_next_level,streakDays:profile.streak_days,completionRate:Number(profile.completion_rate),attributes:attrs,equipment:[],recentGains:[]})}
 const loadQuests=async()=>setQuests(await getQuests())
 const enterApp=async()=>{setBootError('');try{await Promise.all([loadPlayer(),loadQuests()]);setScreen('home')}catch(e){setBootError(e instanceof Error?e.message:'Não foi possível carregar o MindUp.')}}
 useEffect(()=>{let active=true;const timer=window.setTimeout(async()=>{if(!supabaseConfigured){setBootError('Supabase não configurado. Confira .env.local.');setBooting(false);return}try{const {data:{session}}=await supabase.auth.getSession();if(!active)return;if(session)await enterApp();else setScreen('login')}catch(e){if(active)setBootError(e instanceof Error?e.message:'Erro ao iniciar o MindUp.')}finally{if(active)setBooting(false)}},500);const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(session&&screen==='login')enterApp();if(!session&&screen!=='splash'&&screen!=='login')setScreen('login')});return()=>{active=false;window.clearTimeout(timer);subscription.unsubscribe()}},[])
 const openQuest=(id:string)=>{const q=quests.find(x=>x.slug===id);if(!q){setBootError('Quest não encontrada no banco.');return}setSelectedQuest({id:String(q.id),name:q.title,icon:q.icon,category:q.category,xp:q.xp_reward,difficulty:q.difficulty,progress:0,desc:q.description??'',heroBg:q.hero_bg??'',verify:q.verification_type,checklist:q.quest_checklist_items?.sort((a:any,b:any)=>a.position-b.position).map((x:any)=>x.description)});setScreen('detail')}
 const completeQuest=async()=>{if(!selectedQuest)return;try{await completeQuestRemote(Number(selectedQuest.id));await enterApp();setPopup(true);window.setTimeout(()=>setPopup(false),3800)}catch(e){setBootError(e instanceof Error?e.message:'Não foi possível concluir a quest. Confira as migrações do banco.')}}
 const activeNav=useMemo(()=>['home','attributes','mentor','equipment','profile'].includes(screen)?screen as Screen:null,[screen])
 if(booting)return <main className="app-shell"><div className="phone-frame"><Splash/></div></main>
 if(bootError&&!['login','detail'].includes(screen))return <main className="app-shell"><div className="phone-frame"><section className="sc login"><div className="lg-top"><div className="brand">🧠 <b>MindUp</b></div><div className="deco-line"/><p className="lg-sub">CONNECTION ERROR</p></div><div className="form"><p className="form-error">{bootError}</p><button className="btn-p" onClick={enterApp}>TENTAR NOVAMENTE</button></div></section></div></main>
 return <main className="app-shell"><div className="phone-frame" data-theme={dark?undefined:'light'}>{screen==='login'&&<Login authLogin={authLogin} onToggleMode={()=>setAuthLogin(v=>!v)} onEnter={enterApp}/>} {screen==='home'&&<Home player={player} quests={quests} onQuest={openQuest} onMentor={()=>setScreen('mentor')}/>} {screen==='attributes'&&<Attributes player={player}/>} {screen==='skills'&&<Skills/>} {screen==='equipment'&&<Equipment/>} {screen==='profile'&&<Profile player={player}/>} {screen==='gacha'&&<Gacha/>} {screen==='settings'&&<Settings dark={dark} onToggleTheme={()=>setDark(v=>!v)} onSignOut={async()=>{await supabase.auth.signOut()}}/>} {screen==='detail'&&selectedQuest&&<QuestDetail quest={selectedQuest} onBack={()=>setScreen('home')} onComplete={completeQuest}/>} {screen==='mentor'&&<Mentor player={player} onBack={()=>setScreen('home')}/>} {popup&&<AchievementPopup/>} {activeNav&&<BottomNav active={activeNav} onNavigate={setScreen}/>}</div></main>
}
export default App
