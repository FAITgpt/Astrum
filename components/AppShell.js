'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { demoMode, getSupabaseBrowserClient } from '../lib/supabase';
import { getDemoUser, clearDemoUser } from '../lib/demo';
import { fetchMyProfile } from '../lib/dataService';

const baseNav = [
  ['/dashboard','Mission Dashboard'],
  ['/archive','Astrum Archive'],
  ['/work-plan','Weekly Work Plan'],
  ['/diary','Work Diary']
];

export default function AppShell({children}){
  const router=useRouter(); const path=usePathname();
  const [user,setUser]=useState(null); const [profile,setProfile]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    async function init(){
      if(demoMode){ const u=getDemoUser(); if(!u){router.replace('/login'); return;} if(active){setUser(u);setProfile(u);setLoading(false);} return; }
      const sb=getSupabaseBrowserClient();
      const {data}=await sb.auth.getUser();
      if(!data.user){router.replace('/login'); return;}
      const p=await fetchMyProfile().catch(()=>null);
      if(active){setUser(data.user);setProfile(p);setLoading(false);}
    }
    init();
    if(!demoMode){
      const sb=getSupabaseBrowserClient();
      const {data:sub}=sb.auth.onAuthStateChange((_e,session)=>{ if(!session?.user) router.replace('/login'); else setUser(session.user); });
      return ()=>{active=false;sub.subscription.unsubscribe();};
    }
    return ()=>{active=false;};
  },[router]);
  async function logout(){
    if(demoMode) clearDemoUser(); else await getSupabaseBrowserClient().auth.signOut();
    router.replace('/login');
  }
  if(loading) return <div className="loading">Entering Astrum…</div>;
  const nav=[...baseNav];
  if(['mentor','admin'].includes(profile?.role)) nav.push(['/mentor','Mentor View']);
  return <div className="appShell">
    <aside className="sidebar">
      <div className="brandBlock"><img src="/astrum-crest.png" alt="Astrum crest"/><div><b>ASTRUM</b><small>AD ASTRA. CUM FIDE.</small></div></div>
      <nav>{nav.map(([href,label])=><Link key={href} className={path.startsWith(href)?'active':''} href={href}>{label}</Link>)}</nav>
      <div className="sidebarFoot"><span>{profile?.full_name || user?.email || 'Astrum Scholar'}</span><span>{profile?.role ? profile.role.toUpperCase() : ''}</span><button className="textBtn" onClick={logout}>Sign out</button></div>
    </aside>
    <main className="main">{children}</main>
  </div>
}
