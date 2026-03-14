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
  green   : '#1b3a2b',
  greenMd : '#2d6a4f',
  lime    : '#b5e235',
  limeHov : '#c8f24d',
  offWhite: '#f5f5f0',
  textDk  : '#0f1a10',
  textMd  : '#4a5544',
  textLt  : '#8a9984',
  border  : 'rgba(0,0,0,.08)',
};

const RANK = {
  1: { bg:'#fffbeb', border:'#fde68a', accent:'#d97706', emoji:'🥇' },
  2: { bg:'#f8fafc', border:'#e2e8f0', accent:'#64748b', emoji:'🥈' },
  3: { bg:'#fff7ed', border:'#fed7aa', accent:'#ea580c', emoji:'🥉' },
};

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1 { animation-delay:.06s; }
  .d2 { animation-delay:.14s; }
  .d3 { animation-delay:.22s; }

  .lb-row {
    display:flex; align-items:center; gap:16px;
    background:#fff; border:1.5px solid ${C.border};
    border-radius:18px; padding:16px 20px;
    transition:transform .2s, box-shadow .2s, border-color .18s;
  }
  .lb-row:hover {
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(0,0,0,.07);
    border-color:rgba(0,0,0,.12);
  }

  .btn-cta {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:13px 13px 13px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:14.5px;
    text-decoration:none; border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
  }
  .btn-cta:hover {
    background:${C.limeHov}; transform:translateY(-2px);
    box-shadow:0 12px 28px rgba(181,226,53,.3);
  }
  .btn-cta .ic {
    width:36px; height:36px; border-radius:50%;
    background:${C.textDk}; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    transition:transform .2s;
  }
  .btn-cta:hover .ic { transform:translateX(3px); }

  @media (max-width:1024px) {
    .lb-grid   { grid-template-columns:1fr !important; }
    .right-col { position:static !important; }
    .hero-inner { padding:20px 28px 52px !important; }
  }
  @media (max-width:600px) {
    .hero-inner { padding:16px 20px 44px !important; }
    .hero-h1    { font-size:44px !important; letter-spacing:-1.5px !important; }
    .hero-stats { gap:20px !important; }
    .page-wrap  { padding:24px 16px 64px !important; }
    .stats-grid { grid-template-columns:1fr 1fr !important; }
    .podium     { grid-template-columns:1fr 1fr 1fr !important; }
  }
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
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', background:C.offWhite,
        flexDirection:'column', gap:14,
      }}>
        <div style={{
          width:44, height:44, borderRadius:'50%',
          border:`3px solid ${C.border}`, borderTopColor:C.greenMd,
          animation:'spin 1s linear infinite',
        }}/>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
          Memuat leaderboard...
        </p>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO dengan foto background ══════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:320, background:C.green }}>

        {/* Foto hutan */}
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 30%',
            display:'block',
          }}
        />

        {/* Overlay gradient */}
        <div style={{
          position:'absolute', inset:0,
          background:`linear-gradient(
            105deg,
            rgba(27,58,43,.97) 0%,
            rgba(27,58,43,.90) 35%,
            rgba(27,58,43,.60) 65%,
            rgba(27,58,43,.20) 100%
          )`,
        }}/>

        {/* Decorative circles */}
        <div style={{
          position:'absolute', right:-60, top:-60,
          width:300, height:300, borderRadius:'50%',
          background:'rgba(245,158,11,.07)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', right:130, bottom:40,
          width:150, height:150, borderRadius:'50%',
          border:'1px solid rgba(245,158,11,.13)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', right:175, bottom:75,
          width:62, height:62, borderRadius:'50%',
          border:'1px solid rgba(245,158,11,.20)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', left:'42%', top:36,
          width:5, height:5, borderRadius:'50%',
          background:'rgba(181,226,53,.3)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', left:'58%', bottom:44,
          width:4, height:4, borderRadius:'50%',
          background:'rgba(181,226,53,.2)', pointerEvents:'none',
        }}/>

        {/* Content */}
        <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="hero-inner fu d1" style={{
            display:'flex', alignItems:'flex-end',
            justifyContent:'space-between',
            gap:32, padding:'20px 60px 52px', flexWrap:'wrap',
          }}>
            <div>
              {/* Badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:7,
                background:'rgba(245,158,11,.15)',
                border:'1px solid rgba(245,158,11,.22)',
                borderRadius:99, padding:'5px 14px', marginBottom:18,
              }}>
                <Trophy size={12} color='#fbbf24'/>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:12,
                  color:'#fbbf24', fontWeight:600,
                }}>Hall of Fame</span>
              </div>

              {/* Judul */}
              <h1 className="hero-h1" style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:64, lineHeight:.96, letterSpacing:'-2.5px', color:'#fff',
              }}>
                Leaderboard<br/>
                <span style={{ color:C.lime }}>Pejuang Hutan</span>
              </h1>

              {/* Stats bar */}
              <div className="hero-stats" style={{
                display:'flex', gap:32, marginTop:28, flexWrap:'wrap',
              }}>
                {[
                  { v: summary?.total_trees_planted?.toLocaleString('id') ?? '—', l:'Pohon Ditanam' },
                  { v: summary?.total_donors ?? '—',    l:'Donatur Aktif' },
                  { v: leaders.length,                  l:'Peringkat' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{
                      fontFamily:"'Syne',sans-serif", fontSize:24,
                      fontWeight:800, color:'#fbbf24', lineHeight:1,
                    }}>{v}</p>
                    <p style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                      color:'rgba(255,255,255,.42)', marginTop:4,
                    }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="fu d2" style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.85,
              color:'rgba(255,255,255,.48)', maxWidth:255, paddingBottom:6,
            }}>
              Pahlawan nyata yang menanam harapan untuk masa depan hutan Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'40px 60px 80px' }}>
          <div className="lb-grid" style={{
            display:'grid', gridTemplateColumns:'1fr 320px',
            gap:28, alignItems:'start',
          }}>

            {/* ── LEFT: podium + full list ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Podium top 3 */}
              {leaders.length >= 3 && (
                <div className="podium fu d1" style={{
                  display:'grid', gridTemplateColumns:'1fr 1.12fr 1fr',
                  gap:12, alignItems:'flex-end',
                }}>
                  {[leaders[1], leaders[0], leaders[2]].map((l, idx) => {
                    if (!l) return <div key={idx}/>;
                    const r = RANK[l.rank];
                    const isMid = idx === 1;
                    return (
                      <div key={l.rank} style={{
                        background:r.bg, border:`2px solid ${r.border}`,
                        borderRadius:20,
                        padding: isMid ? '24px 14px' : '18px 12px',
                        textAlign:'center',
                        boxShadow: isMid ? `0 12px 32px ${r.accent}18` : 'none',
                      }}>
                        <div style={{ fontSize: isMid?28:22, marginBottom:8 }}>{r.emoji}</div>
                        <div style={{
                          width:44, height:44, borderRadius:'50%',
                          background:C.green, display:'flex',
                          alignItems:'center', justifyContent:'center',
                          margin:'0 auto 8px',
                          fontFamily:"'Syne',sans-serif", fontSize:16,
                          fontWeight:800, color:C.lime,
                        }}>
                          {l.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <p style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                          fontWeight:700, color:C.textDk, marginBottom:5,
                          lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis',
                          display:'-webkit-box', WebkitLineClamp:2,
                          WebkitBoxOrient:'vertical',
                        }}>{l.user?.name || 'Anonim'}</p>
                        <p style={{
                          fontFamily:"'Syne',sans-serif",
                          fontSize: isMid?20:16, fontWeight:800, color:r.accent,
                        }}>
                          {l.total_trees?.toLocaleString('id')} 🌳
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full ranking */}
              <div className="fu d2" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {leaders.map(l => {
                  const r = RANK[l.rank];
                  const isTop = !!r;
                  return (
                    <div key={l.rank} className="lb-row"
                      style={isTop ? { background:r.bg, borderColor:r.border } : {}}
                    >
                      <div style={{
                        width:36, height:36, borderRadius:10, flexShrink:0,
                        background: isTop ? 'rgba(0,0,0,.06)' : C.offWhite,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {isTop
                          ? <span style={{ fontSize:18 }}>{r.emoji}</span>
                          : <span style={{
                              fontFamily:"'Syne',sans-serif", fontSize:13,
                              fontWeight:700, color:C.textLt,
                            }}>#{l.rank}</span>
                        }
                      </div>
                      <div style={{
                        width:40, height:40, borderRadius:'50%',
                        background:C.green, flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:"'Syne',sans-serif", fontSize:15,
                        fontWeight:800, color:C.lime,
                      }}>
                        {l.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:14.5,
                          fontWeight:600, color:C.textDk,
                          overflow:'hidden', textOverflow:'ellipsis',
                          whiteSpace:'nowrap', marginBottom:2,
                        }}>
                          {l.user?.name || 'Anonim'}
                        </p>
                        <p style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                        }}>
                          {l.donation_count}× donasi
                        </p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{
                          fontFamily:"'Syne',sans-serif",
                          fontSize: isTop?20:17, fontWeight:800,
                          color: isTop ? r.accent : C.greenMd,
                          lineHeight:1, marginBottom:2,
                        }}>
                          {l.total_trees?.toLocaleString('id')} 🌳
                        </p>
                        <p style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                        }}>
                          {l.total_amount}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {leaders.length === 0 && (
                  <div style={{
                    background:'#fff', borderRadius:22,
                    border:`1px solid ${C.border}`,
                    padding:'52px', textAlign:'center',
                  }}>
                    <TreePine size={36} color="rgba(0,0,0,.1)" style={{ marginBottom:12 }}/>
                    <p style={{
                      fontFamily:"'Syne',sans-serif", fontSize:17,
                      fontWeight:700, color:C.textDk, marginBottom:6,
                    }}>Belum ada donasi</p>
                    <p style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                      color:C.textLt, marginBottom:20,
                    }}>Jadilah yang pertama! 🌱</p>
                    <Link to="/donate" className="btn-cta">
                      Donasi Pohon
                      <span className="ic"><ArrowRight size={15} color={C.lime}/></span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: sticky sidebar ── */}
            <div className="right-col" style={{
              position:'sticky', top:96,
              display:'flex', flexDirection:'column', gap:16,
            }}>

              {/* Stats */}
              {summary && (
                <div className="fu d1" style={{
                  background:'#fff', borderRadius:20,
                  border:`1px solid ${C.border}`, padding:'22px 22px',
                }}>
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                    fontWeight:700, color:C.textLt, letterSpacing:'.8px',
                    textTransform:'uppercase', marginBottom:16,
                  }}>Statistik Global</p>
                  <div className="stats-grid" style={{
                    display:'grid', gridTemplateColumns:'1fr 1fr', gap:10,
                  }}>
                    {[
                      { icon:TreePine, val:summary.total_trees_planted?.toLocaleString('id'), label:'Pohon Ditanam', color:C.greenMd },
                      { icon:Heart,    val:summary.total_donors,    label:'Donatur',   color:'#e11d48' },
                      { icon:Users,    val:summary.total_donations,  label:'Transaksi', color:'#0ea5e9' },
                      { icon:Trophy,   val:leaders.length,           label:'Peringkat', color:'#f59e0b' },
                    ].map(({ icon:Icon, val, label, color }) => (
                      <div key={label} style={{
                        background:C.offWhite, borderRadius:14,
                        padding:'14px 12px', textAlign:'center',
                        border:`1px solid ${C.border}`,
                      }}>
                        <div style={{
                          width:32, height:32, borderRadius:9,
                          background:color+'15', display:'flex',
                          alignItems:'center', justifyContent:'center',
                          margin:'0 auto 8px',
                        }}>
                          <Icon size={16} color={color}/>
                        </div>
                        <p style={{
                          fontFamily:"'Syne',sans-serif", fontSize:20,
                          fontWeight:800, color:C.textDk, lineHeight:1, marginBottom:3,
                        }}>{val ?? '—'}</p>
                        <p style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt,
                        }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA card */}
              <div className="fu d2" style={{
                background:C.green, borderRadius:20, padding:'26px 22px',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{
                  position:'absolute', right:-24, top:-24,
                  width:110, height:110, borderRadius:'50%',
                  background:'rgba(181,226,53,.07)', pointerEvents:'none',
                }}/>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.lime,
                  fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
                  display:'block', marginBottom:10,
                }}>Bergabung</span>
                <h3 style={{
                  fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800,
                  color:'#fff', lineHeight:1.1, marginBottom:8,
                }}>
                  Masuk ke<br/><span style={{ color:C.lime }}>Hall of Fame</span>
                </h3>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13,
                  color:'rgba(255,255,255,.45)', lineHeight:1.7, marginBottom:20,
                }}>
                  Rp 5.000 = 1 pohon nyata ditanam atas namamu.
                </p>
                <Link to="/donate" className="btn-cta" style={{ width:'100%', justifyContent:'center' }}>
                  Donasi Pohon
                  <span className="ic"><ArrowRight size={14} color={C.lime}/></span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}