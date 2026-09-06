'use client';
import { demoMode, getSupabaseBrowserClient } from './supabase';
import { demoSources } from './demoSources';
import { demoProgress, saveDemoProgress } from './demo';

export async function fetchSources(){
  if(demoMode) return demoSources;
  const sb=getSupabaseBrowserClient();
  const {data,error}=await sb.from('sources').select('*').order('id');
  if(error) throw error;
  return data.map(s=>({
    id:s.id,title:s.title,officialSource:s.official_source,tier:s.tier,domain:s.domain,theme:s.theme,
    pathways:s.pathways,coreSelective:s.core_selective,url:s.public_url,phase2:s.phase2,
    brief:s.content?.brief||{},lens:s.content?.lens||{},questions:s.content?.questions||{},audio:s.content?.audio||{},visual:s.content?.visual||{},aegis:s.content?.aegis||{},research:s.content?.research||{}
  }));
}
export async function fetchSource(id){ const all=await fetchSources(); return all.find(x=>x.id===id)||null; }
export async function fetchProgress(){
  if(demoMode) return demoProgress();
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser(); if(!user) return {};
  const {data,error}=await sb.from('source_progress').select('*').eq('user_id',user.id); if(error) throw error;
  return Object.fromEntries((data||[]).map(r=>[r.source_id,r]));
}
export async function setProgress(sourceId,status,percent){
  if(demoMode){ const p=demoProgress(); p[sourceId]={source_id:sourceId,status,percent,updated_at:new Date().toISOString()}; saveDemoProgress(p); return p[sourceId]; }
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser();
  const payload={user_id:user.id,source_id:sourceId,status,percent,completed_at:status==='completed'?new Date().toISOString():null,updated_at:new Date().toISOString()};
  const {data,error}=await sb.from('source_progress').upsert(payload).select().single(); if(error) throw error; return data;
}
export async function fetchDiary(){
  if(demoMode){ try{return JSON.parse(localStorage.getItem('astrum_diary')||'[]')}catch{return[]} }
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser();
  const {data,error}=await sb.from('diary_entries').select('*').eq('student_id',user.id).order('entry_date',{ascending:false}); if(error) throw error; return data||[];
}
export async function addDiary(entry){
  if(demoMode){ const a=await fetchDiary(); const row={id:crypto.randomUUID(),student_id:'demo',created_at:new Date().toISOString(),...entry}; a.unshift(row); localStorage.setItem('astrum_diary',JSON.stringify(a)); return row; }
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser(); const {data,error}=await sb.from('diary_entries').insert({...entry,student_id:user.id}).select().single(); if(error) throw error; return data;
}
export async function fetchPlans(){
  if(demoMode){ try{return JSON.parse(localStorage.getItem('astrum_plans')||'[]')}catch{return[]} }
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser(); const {data,error}=await sb.from('weekly_plans').select('*').eq('student_id',user.id).order('week_of',{ascending:false}); if(error) throw error; return data||[];
}
export async function addPlan(plan){
  if(demoMode){ const a=await fetchPlans(); const row={id:crypto.randomUUID(),student_id:'demo',created_at:new Date().toISOString(),...plan}; a.unshift(row); localStorage.setItem('astrum_plans',JSON.stringify(a)); return row; }
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser(); const {data,error}=await sb.from('weekly_plans').insert({...plan,student_id:user.id}).select().single(); if(error) throw error; return data;
}
export async function fetchMentorStudents(){
  if(demoMode) return [{id:'demo',full_name:'Astrum Scholar',email:'student@astrum.demo',program:'ASTRUM',role:'student'}];
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser();
  const {data:me}=await sb.from('profiles').select('*').eq('id',user.id).single();
  if(!me || !['mentor','admin'].includes(me.role)) return [];
  let q=sb.from('profiles').select('*').eq('role','student'); if(me.role==='mentor') q=q.eq('mentor_id',user.id);
  const {data,error}=await q; if(error) throw error; return data||[];
}

export async function fetchMyProfile(){
  if(demoMode) return {id:'demo',email:'student@astrum.demo',full_name:'Astrum Scholar',role:'student',program:'ASTRUM'};
  const sb=getSupabaseBrowserClient(); const {data:{user}}=await sb.auth.getUser(); if(!user) return null;
  const {data,error}=await sb.from('profiles').select('*').eq('id',user.id).single(); if(error) throw error; return data;
}

export async function fetchMentorStudentsWithStats(){
  if(demoMode) return [{id:'demo',full_name:'Astrum Scholar',email:'student@astrum.demo',program:'ASTRUM',role:'student',hours:42.5,units:1.7,completed:4,in_progress:2,last_activity:new Date().toISOString().slice(0,10)}];
  const sb=getSupabaseBrowserClient(); const me=await fetchMyProfile();
  if(!me || !['mentor','admin'].includes(me.role)) return [];
  let q=sb.from('profiles').select('*').eq('role','student');
  if(me.role==='mentor') q=q.eq('mentor_id',me.id);
  const {data:students,error}=await q; if(error) throw error;
  if(!students?.length) return [];
  const ids=students.map(s=>s.id);
  const [{data:progress,error:pe},{data:diary,error:de}] = await Promise.all([
    sb.from('source_progress').select('user_id,status,updated_at').in('user_id',ids),
    sb.from('diary_entries').select('student_id,hours,entry_date').in('student_id',ids)
  ]);
  if(pe) throw pe; if(de) throw de;
  return students.map(s=>{
    const sp=(progress||[]).filter(x=>x.user_id===s.id);
    const sd=(diary||[]).filter(x=>x.student_id===s.id);
    const hours=sd.reduce((a,b)=>a+Number(b.hours||0),0);
    const dates=sd.map(x=>x.entry_date).filter(Boolean).sort().reverse();
    return {...s,hours,units:hours/25,completed:sp.filter(x=>x.status==='completed').length,in_progress:sp.filter(x=>x.status==='in_progress').length,last_activity:dates[0]||null};
  });
}
