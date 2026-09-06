'use client';
import {useEffect,useState} from 'react';
import AppShell from '../../components/AppShell';
import {fetchMentorStudentsWithStats,fetchMyProfile} from '../../lib/dataService';

export default function Mentor(){
 const [students,setStudents]=useState([]),[me,setMe]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{Promise.all([fetchMentorStudentsWithStats(),fetchMyProfile()]).then(([s,p])=>{setStudents(s);setMe(p);setLoading(false)}).catch(()=>setLoading(false))},[]);
 if(loading) return <AppShell><div className="loading">Opening mentor control…</div></AppShell>;
 if(!['mentor','admin'].includes(me?.role)) return <AppShell><div className="empty">Mentor View is restricted to Astrum mentors and administrators.</div></AppShell>;
 const totalHours=students.reduce((a,b)=>a+Number(b.hours||0),0);
 const totalCompleted=students.reduce((a,b)=>a+Number(b.completed||0),0);
 return <AppShell><div className="pageHead"><div><div className="eyebrow">FACULTY / MENTOR CONTROL</div><h1>Mentor View</h1><p>Track assigned scholars, engagement hours, archive completion, and the weekly mentor operating rhythm.</p></div></div>
 <div className="grid3"><div className="metric"><small>Assigned scholars</small><strong>{students.length}</strong><span>{me.role==='admin'?'Full cohort view':'Mentor-assigned only'}</span></div><div className="metric"><small>Logged engagement</small><strong>{totalHours.toFixed(1)} h</strong><span>{(totalHours/25).toFixed(2)} equivalent units</span></div><div className="metric"><small>Completed source assets</small><strong>{totalCompleted}</strong><span>Across visible scholars</span></div></div>
 <div className="callout" style={{marginTop:18}}>Database row-level security—not just the page UI—limits mentors to their assigned students. Administrators can review the full cohort.</div>
 <h2 className="sectionTitle">Assigned Scholars</h2>{students.length?<table className="table"><thead><tr><th>Scholar</th><th>Program</th><th>Hours</th><th>Units</th><th>Completed</th><th>In Progress</th><th>Last Activity</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td><strong>{s.full_name||s.email}</strong><br/><span className="subtle">{s.email}</span></td><td>{s.program||'ASTRUM'}</td><td>{Number(s.hours||0).toFixed(1)}</td><td>{Number(s.units||0).toFixed(2)}</td><td>{s.completed||0}</td><td>{s.in_progress||0}</td><td>{s.last_activity||'—'}</td></tr>)}</tbody></table>:<div className="empty">No assigned students are visible for this account.</div>}
 <h2 className="sectionTitle">Mentor Operating Rhythm</h2><div className="grid3"><div className="panel"><h3>1. Review</h3><p>Review diary hours, completed archive assets, prior feedback, and any evidence submitted through Elton Dash.</p></div><div className="panel"><h3>2. Diagnose</h3><p>Identify the next mission-relevant competency gap rather than advancing through a rigid syllabus.</p></div><div className="panel"><h3>3. Assign</h3><p>Select an Astrum source, Raven’s Lens, Commander’s Questions, AEGIS inject, and a concrete evidence deliverable.</p></div></div></AppShell>
}
