import Link from 'next/link';
import StatusPill from './StatusPill';
export default function SourceCard({source,status='not_started'}){
  return <Link href={`/archive/${source.id}`} className="sourceCard">
    <div className="cardTop"><span className="sourceId">{source.id}</span>{source.phase2&&<StatusPill type="gold">PHASE II</StatusPill>}</div>
    <h3>{source.title}</h3>
    <p>{source.theme || source.domain}</p>
    <div className="cardMeta"><span>{source.officialSource || source.official_source}</span><StatusPill type={status==='completed'?'green':status==='in_progress'?'blue':'neutral'}>{status.replace('_',' ')}</StatusPill></div>
  </Link>
}
