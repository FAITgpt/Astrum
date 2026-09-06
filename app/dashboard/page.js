'use client';
import { useEffect,useState } from 'react';
import AppShell from '../../components/AppShell';
import SourceCard from '../../components/SourceCard';
import { fetchSources,fetchProgress,fetchDiary,fetchPlans } from '../../lib/dataService';

export default function Dashboard(){
 const [sources,setSources]=useState([]),[progress,setProgress]=useState({}),[diary,setDiary]=useState([]),[plans,setPlans]=useState([]);
 useEffect(()=>{Promise.all([fetchSources(),fetchProgress(),fetchDiary(),fetchPlans()]).then(([s,p,d,w])=>{setSources(s);setProgress(p);setDiary(d);setPlans(w)}).catch(console.error)},[]);
 const completed=Object.values(progress).filter(x=>x.status==='completed').length;
 const inProgress=Object.values(progress).filter(x=>x.status==='in_progress').length;
 const hours=diary.reduce((a,b)=>a+Number(b.hours||0),0); const units=hours/25;
 const pct=Math.min(100,Math.round((hours/900)*100));
 const featured=sources.filter(s=>s.phase2).slice(0,4);
 return <AppShell><div className="pageHead"><div><div className="eyebrow">ASTRUM MISSION CONTROL</div><h1>Mission Dashboard</h1><p>Your personalized view of learning progress, current mission work, and the Astrum Archive.</p></div></div>
 <div className="grid3"><div className="metric"><small>Engagement logged</small><strong>{hours.toFixed(1)} h</strong><span>{units.toFixed(2)} equivalent Elton units</span></div><div className="metric"><small>Archive progress</small><strong>{completed}</strong><span>{inProgress} sources currently in progress</span></div><div className="metric"><small>Master's pathway</small><strong>{pct}%</strong><div className="progressTrack"><div className="progressFill" style={{width:`${pct}%`}}/></div><span>900 engagement hours target</span></div></div>
 <h2 className="sectionTitle">Current Mission</h2><div className="grid2"><div className="panel"><h2>{plans[0]?.learning_goal||'No weekly mission assigned yet'}</h2><p>{plans[0]?.activities||'Use Weekly Work Plan to agree on this week’s learning goal, sources, activities, and evidence with your mentor.'}</p>{plans[0]&&<div className="tagRow"><span className="pill gold">{plans[0].week_of}</span><span className="pill blue">{plans[0].expected_hours||0} expected hours</span></div>}</div><div className="panel"><h2>Astrum Method</h2><div className="callout">What is the mission? → What must be trusted? → What can fail? → What evidence survives? → Who decides?</div><p>Use this five-question sequence whenever a source, architecture, or scenario feels too complex.</p></div></div>
 <h2 className="sectionTitle">Phase II Core Modules</h2><div className="sourceGrid">{featured.map(s=><SourceCard key={s.id} source={s} status={progress[s.id]?.status||'not_started'}/>)}</div>
 </AppShell>
}
