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

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.offWhite}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fu{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}
  .d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.22s}

  .lb-row{
    display:flex;align-items:center;gap:14px;
    background:#fff;border:1px solid ${C.border};
    border-radius:14px;padding:14px 18px;
    transition:transform .18s,box-shadow .18s;
  }
  .lb-row:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.06)}


  .btn-cta{
    display:inline-flex;align-items:center;gap:10px;
    background:${C.lime};color:${C.textDk};
    padding:12px 12px 12px 22px;border-radius:99px;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
    text-decoration:none;border:none;cursor:pointer;
    transition:background .2s,transform .2s,box-shadow .2s;
  }
  .btn-cta:hover{background:${C.limeHov};transform:translateY(-2px);box-shadow:0 10px 28px rgba(181,226,53,.28)}
  .btn-cta .ic{width:32px;height:32px;border-radius:50%;background:${C.textDk};flex-shrink:0;display:flex;align-items:center;justify-content:center}

  @media(max-width:1024px){.lb-grid{grid-template-columns:1fr !important}.right-col{position:static !important}}
  @media(max-width:640px){.hero-content{padding:20px 20px 44px !important}.hero-h1{font-size:44px !important}.page-wrap{padding:24px 16px 64px !important}}
`;

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/donations/leaderboard'),
      api.get('/donations/summary'),
    ]).then(([l, s]) => {
      setLeaders(l.data); setSummary(s.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <><style>{CSS}</style>
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.offWhite, flexDirection:'column', gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.greenMd, animation:'spin 1s linear infinite' }}/>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>Memuat leaderboard...</p>
    </div></>
  );

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO — sama persis dengan DonatePage ══ */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:340, background:C.green }}>

        {/* Foto hutan */}
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 30%', display:'block' }}
        />

        {/* Overlay gradient — identik dengan DonatePage */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,rgba(27,58,43,.97) 0%,rgba(27,58,43,.90) 35%,rgba(27,58,43,.60) 65%,rgba(27,58,43,.20) 100%)' }}/>



        <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-content" style={{ padding:'20px 60px 56px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            <div>
              <h1 className="hero-h1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:64, lineHeight:.96, letterSpacing:'-2.5px', color:'#fff' }}>
                Leaderboard<br/><span style={{ color:C.lime }}>Pejuang Hutan</span>
              </h1>
              {/* Stats — sama dengan DonatePage */}
              <div style={{ display:'flex', gap:32, marginTop:28, flexWrap:'wrap' }}>
                {[
                  { v:summary?.total_trees_planted?.toLocaleString('id') ?? '—', l:'Pohon Ditanam' },
                  { v:summary?.total_donors ?? '—', l:'Donatur Aktif' },
                  { v:leaders.length, l:'Peringkat' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:C.lime, lineHeight:1 }}>{v}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'rgba(255,255,255,.42)', marginTop:4 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="fu d2" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.85, color:'rgba(255,255,255,.48)', maxWidth:255, paddingBottom:6 }}>
              Pahlawan nyata yang menanam harapan untuk masa depan hutan Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'36px 60px 80px' }}>
          <div className="lb-grid" style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

            {/* ── LIST ── */}
            <div className="fu d2" style={{ display:'flex', flexDirection:'column', gap:6 }}>

              {leaders.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:22, border:`1px solid ${C.border}`, padding:'52px', textAlign:'center' }}>
                  <TreePine size={36} color="rgba(0,0,0,.1)" style={{ marginBottom:12 }}/>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.textDk, marginBottom:6 }}>Belum ada donatur</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, marginBottom:20 }}>Jadilah yang pertama! 🌱</p>
                  <Link to="/donate" className="btn-cta">Donasi Pohon <span className="ic"><ArrowRight size={14} color={C.lime}/></span></Link>
                </div>
              ) : (
                <>
                  {/* Top 3 */}
                  {top3.map(l => (
                    <div key={l.rank} className="lb-row">
                      {/* Medal */}
                      <div style={{ width:36, flexShrink:0, textAlign:'center', fontSize:20 }}>
                        {l.rank === 1 ? '🥇' : l.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      {/* Avatar */}
                      <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0, background:C.green, border:'1.5px solid rgba(181,226,53,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:C.lime }}>
                        {l.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:600, color:C.textDk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {l.user?.name || 'Anonim'}
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt, marginTop:2 }}>
                          {l.donation_count}× donasi
                        </p>
                      </div>
                      {/* Trees */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:C.greenMd, lineHeight:1 }}>
                          {l.total_trees?.toLocaleString('id')} 🌱
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt, marginTop:2 }}>{l.total_amount}</p>
                      </div>
                    </div>
                  ))}

                  {/* Divider */}
                  {rest.length > 0 && (
                    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'6px 0' }}>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, letterSpacing:'.5px' }}>Peringkat berikutnya</span>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                    </div>
                  )}

                  {/* Rest */}
                  {rest.map(l => (
                    <div key={l.rank} className="lb-row">
                      {/* Rank number */}
                      <div style={{ width:36, flexShrink:0, textAlign:'center' }}>
                        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.textLt }}>#{l.rank}</span>
                      </div>
                      {/* Avatar */}
                      <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, background:C.offWhite, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:C.greenMd }}>
                        {l.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:C.textDk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {l.user?.name || 'Anonim'}
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt, marginTop:2 }}>
                          {l.donation_count}× donasi
                        </p>
                      </div>
                      {/* Trees */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textMd, lineHeight:1 }}>
                          {l.total_trees?.toLocaleString('id')}
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, marginTop:2 }}>pohon</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <div className="right-col fu d3" style={{ position:'sticky', top:96, display:'flex', flexDirection:'column', gap:14 }}>

              {/* Stats — sama style dengan DonatePage summary card */}
              {summary && (
                <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'22px' }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, fontWeight:700, color:C.textLt, letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>Statistik Global</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { Icon:TreePine, val:summary.total_trees_planted?.toLocaleString('id'), label:'Pohon',      color:C.greenMd },
                      { Icon:Heart,    val:summary.total_donors,                               label:'Donatur',    color:'#e11d48' },
                      { Icon:Users,    val:summary.total_donations,                            label:'Transaksi',  color:'#0ea5e9' },
                      { Icon:Trophy,   val:leaders.length,                                     label:'Peringkat',  color:'#f59e0b' },
                    ].map(({ Icon, val, label, color }) => (
                      <div key={label} style={{ background:C.offWhite, borderRadius:12, padding:'12px', textAlign:'center', border:`1px solid ${C.border}` }}>
                        <div style={{ width:28, height:28, borderRadius:8, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 7px' }}>
                          <Icon size={14} color={color}/>
                        </div>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:C.textDk, lineHeight:1, marginBottom:2 }}>{val ?? '—'}</p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA — sama style dengan DonatePage order summary card */}
              <div style={{ background:C.green, borderRadius:20, padding:'24px 22px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:-24, top:-24, width:110, height:110, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.lime, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', display:'block', marginBottom:10, position:'relative' }}>
                  Ambil Aksi
                </p>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fff', lineHeight:1.1, marginBottom:8, position:'relative' }}>
                  Masuk ke<br/><span style={{ color:C.lime }}>Hall of Fame</span>
                </h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'rgba(255,255,255,.42)', lineHeight:1.7, marginBottom:18, position:'relative' }}>
                  Rp 5.000 = 1 pohon nyata ditanam atas namamu.
                </p>
                <Link to="/donate" className="btn-cta" style={{ width:'100%', justifyContent:'center', position:'relative' }}>
                  Donasi Pohon <span className="ic"><ArrowRight size={13} color={C.lime}/></span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}