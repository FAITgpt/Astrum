'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import AppShell from '../../../components/AppShell';
import StatusPill from '../../../components/StatusPill';
import {fetchSource,fetchProgress,setProgress} from '../../../lib/dataService';

function TextRows({obj,prefix}){ if(!obj) return null; return Object.entries(obj).filter(([k,v])=>v && (!prefix||k.startsWith(prefix))).map(([k,v])=><div key={k}><h4>{k.replaceAll('_',' ')}</h4><p>{String(v)}</p></div>); }
export default function SourceDetail(){
 const {id}=useParams(); const [s,setS]=useState(null),[status,setStatus]=useState('not_started'),[tab,setTab]=useState('brief');
 useEffect(()=>{Promise.all([fetchSource(id),fetchProgress()]).then(([src,p])=>{setS(src);setStatus(p[id]?.status||'not_started')})},[id]);
 if(!s) return <AppShell><div className="loading">Opening source…</div></AppShell>;
 const q=Object.entries(s.questions||{}).filter(([k])=>k.startsWith('CQ-')).map(([,v])=>v).filter(Boolean);
 const tabs=[['brief','Astrum Brief'],['lens',"Raven's Lens"],['questions',"Commander's Questions"],['audio','Audio Briefing'],['visual','Visual'],['aegis','AEGIS'],['research','Research']];
 async function mark(next){const pct=next==='completed'?100:next==='in_progress'?50:0; await setProgress(s.id,next,pct); setStatus(next);}
 return <AppShell><div className="archiveDetail"><div className="breadcrumb"><Link href="/archive">ASTRUM ARCHIVE</Link> / {s.id}</div><section className="heroPanel"><div className="tagRow"><StatusPill type="gold">{s.id}</StatusPill>{s.phase2&&<StatusPill type="blue">Phase II Produced</StatusPill>}<StatusPill>{s.officialSource}</StatusPill></div><h1>{s.title}</h1><p>{s.theme || s.domain}</p><div className="actionRow"><button className="secondaryBtn" onClick={()=>mark('in_progress')}>Mark In Progress</button><button className="primaryBtn" onClick={()=>mark('completed')}>Mark Completed</button>{s.url&&<a className="secondaryBtn" href={s.url} target="_blank" rel="noreferrer">Open Official Source ↗</a>}<StatusPill type={status==='completed'?'green':status==='in_progress'?'blue':'neutral'}>{status.replace('_',' ')}</StatusPill></div></section>
 <div className="detailTabs">{tabs.map(([k,l])=><button className={tab===k?'active':''} key={k} onClick={()=>setTab(k)}>{l}</button>)}</div>
 {tab==='brief'&&<div className="contentBlock"><h2>{s.brief?.['Proposed Brief Title']||s.title}</h2><p>{s.brief?.['Brief Abstract / Teaching Angle']}</p><h4>Key Learning Payoff</h4><p>{s.brief?.['Key Learning Payoff']}</p><h4>Why Now</h4><p>{s.brief?.['What Changed / Why Now']}</p><h4>Dash Evidence</h4><p>{s.brief?.['Suggested Dash Deliverable']}</p></div>}
 {tab==='lens'&&<div className="contentBlock"><h2>The Raven's Lens</h2><blockquote>{s.lens?.["Raven's Lens Commentary"]}</blockquote><h4>Hidden Assumption</h4><p>{s.lens?.['Hidden Assumption']}</p><h4>Likely Failure Point</h4><p>{s.lens?.['Likely Failure Point']}</p><h4>What They Didn't Say</h4><p>{s.lens?.["What They Didn't Say"]}</p><h4>Signature Raven Question</h4><p>{s.lens?.['Signature Raven Question']}</p></div>}
 {tab==='questions'&&<div className="contentBlock"><h2>Commander's Questions</h2><ol>{q.map((x,i)=><li key={i}>{x}</li>)}</ol></div>}
 {tab==='audio'&&<div className="contentBlock"><h2>{s.audio?.['Episode / Briefing Title']||'ASTRUM Audio Briefing'}</h2><div className="tagRow"><StatusPill type="gold">{s.audio?.['Est. Duration']}</StatusPill><StatusPill>{s.audio?.['Voice / Tone']}</StatusPill></div><h4>Opening Hook</h4><blockquote>{s.audio?.['Opening Hook']}</blockquote><TextRows obj={s.audio} prefix="Segment"/><h4>Closing Raven Question</h4><p>{s.audio?.['Closing Raven Question']}</p></div>}
 {tab==='visual'&&<div className="contentBlock"><h2>{s.visual?.['Asset Title']||'Astrum Visual'}</h2><h4>Recommended Format</h4><p>{s.visual?.['Recommended Format']}</p><h4>Story</h4><p>{s.visual?.['Key Story the Visual Should Tell']}</p><h4>Must Show</h4><p>{s.visual?.['Must-Show Elements']}</p><h4>Production Notes</h4><p>{s.visual?.['Production Notes']}</p></div>}
 {tab==='aegis'&&<div className="contentBlock"><h2>MISSION AEGIS ORBIT</h2><h4>Linked Injects</h4><p>{s.aegis?.['Linked Inject IDs']}</p><h4>Suggested Assignment</h4><p>{s.aegis?.['Suggested Assignment IDs']}</p><h4>Weekly Activity</h4><p>{s.aegis?.['Suggested Weekly Activity']}</p><h4>Mission Task</h4><blockquote>{s.aegis?.['Mission Task Prompt']}</blockquote><h4>Evaluation Focus</h4><p>{s.aegis?.['Evaluation Focus']}</p></div>}
 {tab==='research'&&<div className="contentBlock"><h2>Astrum Research Vector</h2><p>{s.research?.['Research Vector']}</p><h4>Master's-Level Option</h4><p>{s.research?.["Master's-Level Option"]}</p><h4>PhD / Publication Option</h4><p>{s.research?.['PhD / Publication Option']}</p><h4>Best-Fit Pathways</h4><p>{s.research?.['Cross-Links / Best-Fit Pathways']}</p></div>}
 </div></AppShell>
}
