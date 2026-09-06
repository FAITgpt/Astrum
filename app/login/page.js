'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { demoMode, getSupabaseBrowserClient } from '../../lib/supabase';
import { setDemoUser } from '../../lib/demo';

export default function Login(){
 const [email,setEmail]=useState('student@astrum.demo'); const [password,setPassword]=useState('astrum'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const router=useRouter();
 useEffect(()=>{ if(!demoMode) setEmail(''); },[]);
 async function submit(e){ e.preventDefault(); setBusy(true); setError('');
   if(demoMode){ setDemoUser({email,full_name:'Astrum Scholar',role:'student'}); router.push('/dashboard'); return; }
   const sb=getSupabaseBrowserClient(); const {error}=await sb.auth.signInWithPassword({email,password});
   if(error){setError(error.message);setBusy(false);} else router.push('/dashboard');
 }
 return <div className="loginPage">
   <div className="loginGlow"></div>
   <section className="loginPanel">
     <img src="/astrum-crest.png" alt="Astrum crest" className="loginCrest"/>
     <div className="eyebrow">THE ADAM INSTITUTE AT ELTON</div>
     <h1>WELCOME TO <span>ASTRUM</span></h1>
     <p className="motto">AD ASTRA. CUM FIDE.</p>
     <p className="subtle">Private mission systems learning environment</p>
     <form onSubmit={submit}>
       <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
       <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
       {error&&<div className="error">{error}</div>}
       <button className="primaryBtn" disabled={busy}>{busy?'Authenticating…':'CONTINUE MISSION'}</button>
     </form>
     {demoMode&&<div className="demoNote">Demo mode is active. Production deployment uses individual Supabase accounts.</div>}
   </section>
 </div>
}
