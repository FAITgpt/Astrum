export function getDemoUser(){
  if(typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('astrum_demo_user') || 'null'); } catch { return null; }
}
export function setDemoUser(user){ localStorage.setItem('astrum_demo_user', JSON.stringify(user)); }
export function clearDemoUser(){ localStorage.removeItem('astrum_demo_user'); }
export function demoProgress(){
  if(typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('astrum_progress') || '{}'); } catch { return {}; }
}
export function saveDemoProgress(v){ localStorage.setItem('astrum_progress', JSON.stringify(v)); }
