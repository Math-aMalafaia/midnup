import { useState } from 'react'
import { signIn, signUp } from '../services/auth'

type Props={authLogin:boolean;onToggleMode:()=>void;onEnter:()=>void}

export function Login({authLogin,onToggleMode,onEnter}:Props){
  const [username,setUsername]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      if(authLogin){
        await signIn(email,password)
        onEnter()
      } else {
        await signUp(email,password,username)
        setMessage('Conta criada! Se a confirmação de email estiver ativa, confira sua caixa de entrada.')
      }
    } catch(err){
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.')
    } finally { setLoading(false) }
  }

  return <section className="sc login"><div className="lg-top"><div className="brand">🧠 <b>MindUp</b></div><div className="deco-line"/><p className="lg-sub">{authLogin?'Begin Your Journey':'Create Your Hero'}</p></div><form className="form" onSubmit={submit}>
    {!authLogin&&<label>Hero Name<input className="fi" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose your legend name…" required/></label>}
    <label>Email<input className="fi" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="your@email.com" required/></label>
    <label>Password<input className="fi" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••" minLength={6} required/></label>
    {error&&<p className="form-error">{error}</p>}{message&&<p className="form-success">{message}</p>}
    <button className="btn-p" disabled={loading}>{loading?'⏳ LOADING...':'⚔️  ENTER THE REALM'}</button><div className="rune-row">✦ ✦ ✦</div><button type="button" className="link-btn" onClick={()=>{setError('');setMessage('');onToggleMode()}}>Don't have an account? <span>{authLogin?'Sign Up':'Log In'}</span></button>
  </form></section>
}
