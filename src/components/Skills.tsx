import { useEffect, useState } from 'react'
import { PageHead } from './PageHead'
import { supabase } from '../lib/supabase'

type Skill = { id:number; name:string; description:string|null; icon:string; required_level:number; cost:number }
type OwnedSkill = { skill_id:number; skill_level:number }

export function Skills(){
  const [skills,setSkills]=useState<Skill[]>([]); const [owned,setOwned]=useState<OwnedSkill[]>([])
  const [points,setPoints]=useState(0); const [level,setLevel]=useState(1); const [busy,setBusy]=useState<number|null>(null); const [error,setError]=useState('')
  const load=async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const [s,p,u]=await Promise.all([supabase.from('skills').select('*').order('id'),supabase.from('profiles').select('skill_points,level').eq('id',user.id).single(),supabase.from('user_skills').select('skill_id,skill_level').eq('user_id',user.id)]);setSkills(s.data??[]);setPoints(p.data?.skill_points??0);setLevel(p.data?.level??1);setOwned(u.data??[])}
  useEffect(()=>{load()},[])
  const unlock=async(id:number)=>{setBusy(id);setError('');try{const {error:e}=await supabase.rpc('unlock_skill',{p_skill_id:id});if(e)throw e;await load()}catch(e){setError(e instanceof Error?e.message:'Não foi possível desbloquear a habilidade.')}finally{setBusy(null)}}
  return <section className="sc"><div className="scr-scroll"><PageHead title="Skill Tree" sub="Unlock abilities as your hero grows."/><div className="skill-points">✦ <b>{points} Skill Points</b> available · Level {level}</div>{error&&<p className="form-error">{error}</p>}<div className="tree">{skills.map(skill=>{const isOwned=owned.some(x=>x.skill_id===skill.id);const can=!isOwned&&level>=skill.required_level&&points>=skill.cost;return <button className={isOwned?'node unlocked':'node'} key={skill.id} disabled={!can||busy!==null} onClick={()=>unlock(skill.id)}><span>{skill.icon}</span><b>{skill.name}</b><small>{isOwned?'UNLOCKED':level<skill.required_level?'REQUIRES LEVEL '+skill.required_level:points<skill.cost?'NEEDS '+skill.cost+' POINT':'UNLOCK · '+skill.cost+' POINT'}</small></button>})}</div></div></section>
}
