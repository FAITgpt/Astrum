'use client';
import { useEffect,useMemo,useState } from 'react';
import AppShell from '../../components/AppShell';
import SourceCard from '../../components/SourceCard';
import {fetchSources,fetchProgress} from '../../lib/dataService';

export default function Archive(){
 const [sources,setSources]=useState([]),[progress,setProgress]=useState({}),[q,setQ]=useState(''),[domain,setDomain]=useState('All');
 useEffect(()=>{Promise.all([fetchSources(),fetchProgress()]).then(([s,p])=>{setSources(s);setProgress(p)})},[]);
 const domains=useMemo(()=>['All',...new Set(sources.map(s=>s.domain).filter(Boolean))],[sources]);
 const filtered=sources.filter(s=>(domain==='All'||s.domain===domain)&&(`${s.title} ${s.theme} ${s.domain}`.toLowerCase().includes(q.toLowerCase())));
 return <AppShell><div className="pageHead"><div><div className="eyebrow">THE ASTRUM ARCHIVE</div><h1>Mission Knowledge Library</h1><p>Public-source doctrine and standards transformed through Astrum Briefs, Raven’s Lens commentary, audio scripts, visual concepts, AEGIS scenarios, and research vectors.</p></div></div>
 <div className="searchBar"><input placeholder="Search doctrine, AI, PNT, cyber, commercial space…" value={q} onChange={e=>setQ(e.target.value)}/><select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select></div>
 <div className="sourceGrid">{filtered.map(s=><SourceCard key={s.id} source={s} status={progress[s.id]?.status||'not_started'}/>)}</div></AppShell>
}
