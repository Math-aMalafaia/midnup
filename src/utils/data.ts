export type Screen = 'splash'|'login'|'home'|'detail'|'attributes'|'mentor'|'skills'|'equipment'|'profile'|'gacha'|'settings'
export type Attribute = { level:number; pct:number }
export type Player = {
  name:string
  level:number
  rank:string
  totalXP:number
  xpInLevel:number
  xpToNextLevel:number
  streakDays:number
  completionRate:number
  attributes:Record<string,Attribute>
  equipment:string[]
  recentGains:string[]
}
export type Quest = { id:string; name:string; icon:string; category:string; xp:number; difficulty:string; progress:number; desc:string; heroBg:string; verify:'checklist'|'quiz'|'photo'|'none'; checklist?:string[] }

export const PLAYER:Player = {name:'Aelindra',level:12,rank:'Iron Sage',totalXP:3450,xpInLevel:1150,xpToNextLevel:1700,streakDays:7,completionRate:89,attributes:{Focus:{level:18,pct:78},Discipline:{level:14,pct:62},Creativity:{level:11,pct:45},Energy:{level:16,pct:70},Knowledge:{level:20,pct:88},Resilience:{level:9,pct:38}},equipment:['Focus Blade (Rare)','Orb of Clarity (Epic)','Ring of Discipline (Epic)'],recentGains:['Knowledge +8 (Today)','Energy +5 (Yesterday)','Focus +12 (2 days ago)']}

export const QUESTS:Record<string,Quest> = {
  study:{id:'study',name:'Deep Study Session',icon:'📚',category:'Knowledge',xp:120,difficulty:'Medium',progress:60,desc:'Study a focused topic without distractions and consolidate what you learned.',heroBg:'linear-gradient(135deg,#243f6b,#5a3c88)',verify:'quiz'},
  exercise:{id:'exercise',name:'Morning Training',icon:'⚔️',category:'Energy',xp:90,difficulty:'Easy',progress:0,desc:'Complete your planned training session and build your Energy attribute.',heroBg:'linear-gradient(135deg,#174d38,#2b7654)',verify:'checklist',checklist:['Warm up for 5 minutes','Complete the main workout','Cool down and stretch']},
  focus:{id:'focus',name:'Focus Sprint',icon:'🎯',category:'Focus',xp:100,difficulty:'Medium',progress:35,desc:'Complete a distraction-free focus sprint and protect your streak.',heroBg:'linear-gradient(135deg,#35236a,#244c7c)',verify:'checklist',checklist:['Define one clear goal','Work without distractions','Review your result']},
  journal:{id:'journal',name:'Daily Reflection',icon:'📖',category:'Resilience',xp:70,difficulty:'Easy',progress:0,desc:'Reflect on the day, capture a lesson, and prepare your next move.',heroBg:'linear-gradient(135deg,#553b24,#855d2d)',verify:'photo'}
}

export const GACHA_ITEMS=[
 {ico:'👑',nm:'Crown of Legends',desc:'+50 XP for 24 hours',rar:'LEGENDARY',col:'#F5C842'},
 {ico:'🔮',nm:'Orb of Clarity',desc:'+20% XP on Focus tasks',rar:'EPIC',col:'#9B72E8'},
 {ico:'🗡️',nm:'Blade of Focus',desc:'+15% Focus when equipped',rar:'RARE',col:'#7B9FD4'},
 {ico:'📜',nm:'Tome of Wisdom',desc:'Gain +5 Knowledge XP daily',rar:'UNCOMMON',col:'#4ADE80'},
 {ico:'🧪',nm:'Energy Elixir',desc:'Restore 20 Energy points',rar:'COMMON',col:'#9ca3af'},
 {ico:'🛡️',nm:'Shield of Discipline',desc:'Protect streak for 1 day',rar:'RARE',col:'#7B9FD4'}
]
