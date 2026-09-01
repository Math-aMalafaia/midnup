import { useEffect,useState } from 'react'
import { PageHead } from './PageHead'
import { SectionTitle } from './Home'
import { supabase } from '../lib/supabase'

type Item={id:number;name:string;description:string|null;icon:string;rarity:string;type:string;quantity?:number;equipped?:boolean}
export function Equipment(){
 const [gear,setGear]=useState<Item[]>([]); const [owned,setOwned]=useState<Item[]>([]); const [busy,setBusy]=useState<number|null>(null); const [error,setError]=useState('')
 const load=async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)return;const [items,o]=await Promise.all([supabase.from('equipment').select('*').order('id'),supabase.from('user_equipment').select('quantity,equipped,equipment(*)').eq('user_id',user.id)]);setGear(items.data??[]);setOwned((o.data??[]).map((x:any)=>({...x.equipment,quantity:x.quantity,equipped:x.equipped}))}
 useEffect(()=>{load()},[])
 const equip=async(id:number)=>{setBusy(id);setError('');try{const {error:e}=await supabase.rpc('equip_item',{p_equipment_id:id});if(e)throw e;await load()}catch(e){setError(e instanceof Error?e.message:'Não foi possível equipar o item.')}finally{setBusy(null)}}
 return <section className="sc"><div className="scr-scroll"><PageHead title="Equipment" sub="Equip gear to enhance your attributes."/>{error&&<p className="form-error">{error}</p>}<div className="panel"><h3>Equipped</h3><div className="slots">{owned.filter(x=>x.equipped).slice(0,4).map(x=><div className="slot fill" key={x.id}><span>{x.icon}</span><small>{x.type}</small></div>)}{owned.filter(x=>x.equipped).length===0&&<p className="empty-state">No equipment equipped yet.</p>}</div></div><SectionTitle title="Inventory"/><div className="inv-grid">{gear.map(x=>{const own=owned.find(o=>o.id===x.id);return <button className="item" key={x.id} disabled={!own||busy!==null} onClick={()=>own&&equip(x.id)}><span>{x.icon}</span><b>{x.name}</b><small>{own?`OWNED · ${own.quantity} · ${own.equipped?'EQUIPPED':'EQUIP'}`:'NOT OWNED'} · {x.rarity.toUpperCase()}</small></button>})}</div></div></section>
}
