import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props={children:ReactNode}
type State={error:Error|null}

export class AppErrorBoundary extends Component<Props,State>{
 state:State={error:null}
 static getDerivedStateFromError(error:Error):State{return {error}}
 componentDidCatch(error:Error,info:ErrorInfo){console.error('[MindUp] Render error',error,info)}
 render(){if(this.state.error)return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#0A0D18',color:'#E8EAF0',fontFamily:'Nunito, sans-serif'}}><section style={{maxWidth:620,width:'100%',padding:24,border:'1px solid #7B9FD4',borderRadius:20,background:'#202531'}}><h1 style={{marginBottom:10}}>MindUp encontrou um erro</h1><p style={{opacity:.8,marginBottom:14}}>A aplicação não ficou em branco silenciosamente. Veja o erro abaixo e abra o console se precisar.</p><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:13,opacity:.9}}>{this.state.error.message}</pre><button style={{marginTop:18,padding:'12px 18px',border:0,borderRadius:12,cursor:'pointer'}} onClick={()=>location.reload()}>Recarregar</button></section></main>;return this.props.children}
}
