import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Trophy, TreePine, Heart, ArrowRight, Users } from 'lucide-react';

if (!document.getElementById('lb-fonts')) {
  const l = document.createElement('link');
  l.id = 'lb-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

const C = {
  green:'#1b3a2b', greenMd:'#2d6a4f', lime:'#b5e235', limeHov:'#c8f24d',
  offWhite:'#f5f5f0', textDk:'#0f1a10', textMd:'#4a5544', textLt:'#8a9984',
  border:'rgba(0,0,0,.08)',
};

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' };

const CSS = `
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.9); } to { opacity:1; transform:scale(1); } }

  .fu  { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.06s; }
  .d2  { animation-delay:.14s; }
  .d3  { animation-delay:.22s; }

  /* ── Leaderboard row ── */
  .lb-row {
    display:flex; align-items:center; gap:14px;
    background:#fff; border:1px solid ${C.border};
    border-radius:16px; padding:14px 18px;
    transition:transform .18s, box-shadow .18s;
    -webkit-tap-highlight-color:transparent;
  }
  .lb-row:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
  .lb-row:active { transform:scale(.99); }

  /* Top 3 special */
  .lb-row.rank-1 { background:linear-gradient(135deg,#fffbf0,#fff); border-color:rgba(251,191,36,.3); }
  .lb-row.rank-2 { background:linear-gradient(135deg,#f8f8f8,#fff); border-color:rgba(156,163,175,.3); }
  .lb-row.rank-3 { background:linear-gradient(135deg,#fff8f5,#fff); border-color:rgba(180,120,80,.2); }

  /* ── CTA button ── */
  .btn-cta {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:12px 12px 12px 22px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:14px;
    text-decoration:none; border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-cta:hover  { background:${C.limeHov}; transform:translateY(-2px); box-shadow:0 10px 28px rgba(181,226,53,.3); }
  .btn-cta:active { transform:scale(.97); }
  .btn-cta .ic {
    width:32px; height:32px; border-radius:50%;
    background:${C.textDk}; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }

  /* ── Podium cards (mobile top-3) ── */
  .podium-card {
    flex:1; background:#fff; border-radius:20px;
    border:1px solid ${C.border}; padding:18px 12px 16px;
    text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;
    animation:popIn .5s cubic-bezier(.16,1,.3,1) both;
    min-width:0;
  }
  .podium-card.first { background:linear-gradient(160deg,#fffbeb,#fff); border-color:rgba(251,191,36,.4); }

  /* ── Stat mini card ── */
  .stat-mini {
    background:${C.offWhite}; border-radius:12px;
    padding:12px; text-align:center;
    border:1px solid ${C.border};
  }

  /* ── Responsive ── */
  @media (max-width:1024px) {
    .lb-grid   { grid-template-columns:1fr !important; }
    .right-col { position:static !important; }
  }
  @media (max-width:640px) {
    .hero-wrap  { padding:16px 20px 36px !important; }
    .hero-h1    { font-size:40px !important; letter-spacing:-1.5px !important; }
    .hero-stats { gap:20px !important; }
    .stat-val   { font-size:20px !important; }
    .page-wrap  { padding:20px 16px 60px !important; }
    .lb-row     { padding:12px 14px !important; border-radius:14px !important; }
    .section-pad{ padding:20px !important; border-radius:18px !important; }
    .info-cols  { grid-template-columns:1fr 1fr !important; }
  }
`;

/* ── Avatar circle ── */
function Avatar({ name, size = 40, green = false }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background: green ? C.green : C.offWhite,
      border: green
        ? '1.5px solid rgba(181,226,53,.25)'
        : `1px solid ${C.border}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Syne',sans-serif",
      fontSize: size * .36, fontWeight:800,
      color: green ? C.lime : C.greenMd,
    }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

/* ── Podium card (mobile top-3 display) ── */
// function PodiumCard({ entry, delay }) {
//   const isFirst = entry.rank === 1;
//   return (
//     <div className={`podium-card${isFirst ? ' first' : ''}`}
//       style={{ animationDelay: `${delay}s` }}>
//       <span style={{ fontSize: isFirst ? 28 : 22 }}>{MEDALS[entry.rank]}</span>
//       <Avatar name={entry.user?.name} size={isFirst ? 48 : 40} green={isFirst}/>
//       <div>
//         <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize: isFirst ? 13.5 : 12.5,
//           fontWeight:700, color:C.textDk, lineHeight:1.3,
//           overflow:'hidden', textOverflow:'ellipsis',
//           display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
//           textAlign:'center' }}>
//           {entry.user?.name || 'Anonim'}
//         </p>
//         <p style={{ fontFamily:"'Syne',sans-serif", fontSize: isFirst ? 17 : 15,
//           fontWeight:800, color:C.greenMd, marginTop:4, textAlign:'center' }}>
//           {entry.total_trees?.toLocaleString('id')} 🌱
//         </p>
//       </div>
//     </div>
//   );
// }

/* ── Row item ── */
function LeaderRow({ entry, showMedal = false }) {
  const isTop = entry.rank <= 3;
  return (
    <div className={`lb-row${isTop ? ` rank-${entry.rank}` : ''}`}>
      {/* Rank/medal */}
      <div style={{ width:34, flexShrink:0, textAlign:'center' }}>
        {showMedal
          ? <span style={{ fontSize:20 }}>{MEDALS[entry.rank]}</span>
          : <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700,
              color:C.textLt }}>#{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <Avatar name={entry.user?.name} green={isTop}/>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600,
          color:C.textDk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {entry.user?.name || 'Anonim'}
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt, marginTop:2 }}>
          {entry.donation_count}× donasi
        </p>
      </div>

      {/* Trees */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, lineHeight:1,
          fontSize: isTop ? 18 : 16,
          color: isTop ? C.greenMd : C.textMd }}>
          {entry.total_trees?.toLocaleString('id')}
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, marginTop:2 }}>
          pohon 🌱
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/donations/leaderboard'),
      api.get('/donations/summary'),
    ]).then(([l, s]) => {
      setLeaders(l.data ?? []);
      setSummary(s.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <><style>{CSS}</style>
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:C.offWhite,
      flexDirection:'column', gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:'50%',
        border:`3px solid ${C.border}`, borderTopColor:C.greenMd,
        animation:'spin 1s linear infinite' }}/>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
        Memuat leaderboard…
      </p>
    </div></>
  );

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  /* ── Sidebar / stats section ── */
  const StatsSidebar = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Global stats */}
      {summary && (
        <div className="section-pad" style={{
          background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'22px',
        }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, fontWeight:700,
            color:C.textLt, letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
            Statistik Global
          </p>
          <div className="info-cols" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
            {[
              { Icon:TreePine, val:summary.total_trees_planted?.toLocaleString('id'), label:'Pohon',     color:C.greenMd },
              { Icon:Heart,    val:summary.total_donors,                               label:'Donatur',   color:'#e11d48'  },
              { Icon:Users,    val:summary.total_donations,                            label:'Transaksi', color:'#0ea5e9'  },
              { Icon:Trophy,   val:leaders.length,                                     label:'Peringkat', color:'#f59e0b'  },
            ].map(({ Icon, val, label, color }) => (
              <div key={label} className="stat-mini">
                <div style={{ width:28, height:28, borderRadius:8, background:color+'15',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 7px' }}>
                  <Icon size={14} color={color}/>
                </div>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:19, fontWeight:800,
                  color:C.textDk, lineHeight:1, marginBottom:3 }}>{val ?? '—'}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA card */}
      <div className="section-pad" style={{
        background:C.green, borderRadius:20, padding:'24px 22px',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-28, top:-28,
          width:120, height:120, borderRadius:'50%',
          background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.lime,
          fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
          marginBottom:10, position:'relative' }}>
          Ambil Aksi
        </p>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
          color:'#fff', lineHeight:1.1, marginBottom:8, position:'relative' }}>
          Masuk ke<br/><span style={{ color:C.lime }}>Hall of Fame</span>
        </h3>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
          color:'rgba(255,255,255,.42)', lineHeight:1.7, marginBottom:18, position:'relative' }}>
          Rp 5.000 = 1 pohon nyata ditanam atas namamu.
        </p>
        <Link to="/donate" className="btn-cta"
          style={{ width:'100%', justifyContent:'center', position:'relative' }}>
          Donasi Pohon <span className="ic"><ArrowRight size={13} color={C.lime}/></span>
        </Link>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }}>
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 30%', display:'block' }}
        />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(105deg,rgba(27,58,43,.97) 0%,rgba(27,58,43,.90) 38%,rgba(27,58,43,.55) 70%,rgba(27,58,43,.2) 100%)' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-wrap" style={{ padding:'16px 60px 52px' }}>
            <h1 className="fu d1 hero-h1" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:60,
              lineHeight:.96, letterSpacing:'-2.5px', color:'#fff', marginBottom:24,
            }}>
              Leaderboard<br/>
              <span style={{ color:C.lime }}>Pejuang Hutan</span>
            </h1>
            <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
              {[
                { v:summary?.total_trees_planted?.toLocaleString('id') ?? '—', l:'Pohon Ditanam' },
                { v:summary?.total_donors ?? '—',                               l:'Donatur Aktif' },
                { v:leaders.length,                                              l:'Peringkat'     },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="stat-val" style={{ fontFamily:"'Syne',sans-serif",
                    fontSize:22, fontWeight:800, color:C.lime, lineHeight:1 }}>{v}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                    color:'rgba(255,255,255,.38)', marginTop:4 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'32px 60px 80px' }}>

          {leaders.length === 0 ? (
            /* Empty state */
            <div style={{ background:'#fff', borderRadius:22, border:`1px solid ${C.border}`,
              padding:'52px 24px', textAlign:'center', maxWidth:440, margin:'0 auto' }}>
              <TreePine size={40} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700,
                color:C.textDk, marginBottom:8 }}>Belum ada donatur</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt,
                marginBottom:22 }}>Jadilah yang pertama! 🌱</p>
              <Link to="/donate" className="btn-cta">
                Donasi Pohon <span className="ic"><ArrowRight size={14} color={C.lime}/></span>
              </Link>
            </div>
          ) : (
            <div className="lb-grid" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

              {/* ── LEFT: list ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>

                {/* ── Mobile podium (3 cards side-by-side, hidden on desktop) ── */}
                {top3.length > 0 && (
                  <div style={{ display:'none' }} className="mob-podium">
                    <style>{`@media(max-width:640px){.mob-podium{display:flex!important;gap:8px;margin-bottom:16px}}`}</style>
                    {/* Reorder: 2nd, 1st, 3rd */}
                    {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => (
                      <PodiumCard key={entry.rank} entry={entry}
                        delay={[.1, 0, .2][i]}/>
                    ))}
                  </div>
                )}

                {/* ── Desktop: all rows ── */}
                <div className="desk-rows">
                  <style>{`@media(max-width:640px){.desk-rows .top3-rows{display:none}}`}</style>

                  {/* Top 3 — hidden on mobile (shown as podium instead) */}
                  <div className="top3-rows" style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:6 }}>
                    {top3.map(entry => (
                      <LeaderRow key={entry.rank} entry={entry} showMedal/>
                    ))}
                  </div>

                  {/* Divider */}
                  {rest.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'8px 0' }}>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                        color:C.textLt, letterSpacing:'.5px', whiteSpace:'nowrap' }}>
                        Peringkat berikutnya
                      </span>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                    </div>
                  )}

                  {/* Rest */}
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {rest.map(entry => (
                      <LeaderRow key={entry.rank} entry={entry}/>
                    ))}
                  </div>
                </div>

                {/* ── Mobile: rest rows after podium ── */}
                <div className="mob-rows" style={{ display:'none', flexDirection:'column', gap:6 }}>
                  <style>{`@media(max-width:640px){.mob-rows{display:flex!important}}`}</style>
                  {rest.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0 8px' }}>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                        color:C.textLt, letterSpacing:'.5px' }}>Peringkat berikutnya</span>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                    </div>
                  )}
                  {rest.map(entry => (
                    <LeaderRow key={entry.rank} entry={entry}/>
                  ))}
                </div>

                {/* Mobile CTA (below list) */}
                {/* <div className="mob-cta" style={{ display:'none', marginTop:8 }}>
                  <style>{`@media(max-width:640px){.mob-cta{display:block!important}}`}</style>
                  <div style={{ background:C.green, borderRadius:18, padding:'20px',
                    position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', right:-20, top:-20,
                      width:100, height:100, borderRadius:'50%',
                      background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
                    <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
                      color:'#fff', lineHeight:1.1, marginBottom:6, position:'relative' }}>
                      Masuk ke <span style={{ color:C.lime }}>Hall of Fame</span>
                    </h3>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                      color:'rgba(255,255,255,.42)', lineHeight:1.7, marginBottom:16, position:'relative' }}>
                      Rp 5.000 = 1 pohon atas namamu
                    </p>
                    <Link to="/donate" className="btn-cta"
                      style={{ width:'100%', justifyContent:'center', position:'relative' }}>
                      Donasi Pohon <span className="ic"><ArrowRight size={13} color={C.lime}/></span>
                    </Link>
                  </div>
                </div> */}

              </div>

              {/* ── RIGHT: stats sidebar (desktop only) ── */}
              <div className="right-col fu d3" style={{ position:'sticky', top:96 }}>
                <StatsSidebar/>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}