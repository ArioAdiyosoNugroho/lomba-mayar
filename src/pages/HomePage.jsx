import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  TreePine, AlertTriangle, Heart, Users, MapPin,
  ArrowRight, ArrowUpRight, Flame, Hammer, Tractor, Axe
} from 'lucide-react';

/* ── Fonts ─────────────────────────────────────────────────────── */
if (!document.getElementById('hp-fonts')) {
  const l = document.createElement('link');
  l.id   = 'hp-fonts';
  l.rel  = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
  document.head.appendChild(l);
}

/* ── Tokens ─────────────────────────────────────────────────────── */
const C = {
  green   : '#1b3a2b',
  greenMd : '#2d6a4f',
  lime    : '#b5e235',
  limeHov : '#c8f24d',
  offWhite: '#f5f5f0',
  textDk  : '#0f1a10',
  textMd  : '#4a5544',
  textLt  : '#8a9984',
};

/* ── Image URLs (real photos via Unsplash) ─────────────────────── */
const IMG = {
  hero : 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&auto=format&fit=crop&q=80',
  wwa  : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=700&auto=format&fit=crop&q=80',
};

/* ── Severity / Type ────────────────────────────────────────────── */
const SEV = {
  low:      { dot:'#60a5fa', label:'Rendah'  },
  medium:   { dot:'#fbbf24', label:'Sedang'  },
  high:     { dot:'#f97316', label:'Tinggi'  },
  critical: { dot:'#ef4444', label:'Kritis'  },
};
const TYPE = {
  sawit_expansion : { icon:TreePine, label:'Sawit'          },
  illegal_logging : { icon:Axe,      label:'Penebangan Liar' },
  forest_fire     : { icon:Flame,    label:'Kebakaran'       },
  land_clearing   : { icon:Tractor,  label:'Buka Lahan'      },
  mining          : { icon:Hammer,   label:'Tambang'         },
  other           : { icon:MapPin,   label:'Lainnya'         },
};

/* ── Global CSS ─────────────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:${C.offWhite}; font-family:'DM Sans',sans-serif; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes ticker {
    from { transform:translateX(0); }
    to   { transform:translateX(-50%); }
  }
  @keyframes pulse-lime {
    0%,100% { box-shadow:0 0 0 0 rgba(181,226,53,.55); }
    60%     { box-shadow:0 0 0 7px rgba(181,226,53,0); }
  }

  .fu  { animation:fadeUp .75s cubic-bezier(.16,1,.3,1) both; }
  .d0  { animation-delay:.04s; }
  .d1  { animation-delay:.15s; }
  .d2  { animation-delay:.28s; }
  .d3  { animation-delay:.42s; }
  .d4  { animation-delay:.58s; }

  /* --- Buttons --- */
  .btn-lime {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:11px 11px 11px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14.5px;
    text-decoration:none; border:none; cursor:pointer; white-space:nowrap;
    transition:background .2s, transform .2s, box-shadow .2s;
  }
  .btn-lime:hover { background:${C.limeHov}; transform:translateY(-2px); box-shadow:0 10px 28px rgba(181,226,53,.3); }
  .btn-lime .ac {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }

  .btn-lime-sm {
    display:inline-flex; align-items:center; gap:8px;
    background:${C.lime}; color:${C.textDk};
    padding:9px 9px 9px 20px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:13.5px;
    text-decoration:none; border:none; cursor:pointer; white-space:nowrap;
    transition:background .2s, transform .2s;
  }
  .btn-lime-sm:hover { background:${C.limeHov}; transform:translateY(-1px); }
  .btn-lime-sm .ac {
    width:28px; height:28px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }

  .btn-dark {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.textDk}; color:#fff;
    padding:11px 11px 11px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14.5px;
    text-decoration:none; border:none; cursor:pointer; white-space:nowrap;
    transition:background .2s, transform .2s;
  }
  .btn-dark:hover { background:#1b3a2b; transform:translateY(-2px); }
  .btn-dark .ac {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:${C.lime}; color:${C.textDk};
    display:flex; align-items:center; justify-content:center;
  }

  .btn-ghost-outline {
    display:inline-flex; align-items:center; gap:6px;
    background:transparent; color:rgba(255,255,255,.72);
    padding:11px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:14px;
    text-decoration:none; border:1.5px solid rgba(255,255,255,.2); cursor:pointer;
    transition:background .2s, border-color .2s, transform .2s;
  }
  .btn-ghost-outline:hover { background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.4); transform:translateY(-2px); }

  /* Ticker */
  .ticker-wrap  { overflow:hidden; width:100%; }
  .ticker-track { display:flex; width:max-content; animation:ticker 34s linear infinite; }
  .ticker-track:hover { animation-play-state:paused; }

  /* Report card */
  .rcard {
    background:#fff; border-radius:20px; overflow:hidden;
    border:1px solid rgba(0,0,0,.07); display:flex; flex-direction:column;
    text-decoration:none; color:inherit;
    transition:transform .28s cubic-bezier(.2,0,0,1), box-shadow .28s;
  }
  .rcard:hover { transform:translateY(-5px); box-shadow:0 20px 50px -10px rgba(0,0,0,.13); }
  .rcard:hover .rcard-title { color:${C.greenMd}; }

  /* WWA left card */
  .wwa-card {
    background:#fff; border-radius:24px; border:1px solid rgba(0,0,0,.08);
    padding:32px; display:flex; flex-direction:column; gap:24px;
  }

  /* Pill tag */
  .pill-tag {
    display:inline-flex; align-items:center; gap:7px;
    border:1px solid rgba(0,0,0,.14); border-radius:99px;
    padding:5px 15px; align-self:flex-start;
    font-family:'DM Sans',sans-serif; font-size:12.5px; color:${C.textMd};
  }

  /* Responsive */
  @media (max-width:1024px) {
    .hero-cols  { flex-direction:column !important; align-items:flex-start !important; gap:24px !important; }
    .hero-title { font-size:58px !important; }
    .wwa-grid   { grid-template-columns:1fr !important; }
    .rep-grid   { grid-template-columns:repeat(2,1fr) !important; }
    .cta-row    { flex-direction:column !important; align-items:flex-start !important; }
  }
  @media (max-width:640px) {
    .hero-title { font-size:40px !important; }
    .hero-img-h { height:280px !important; }
    .rep-grid   { grid-template-columns:1fr !important; }
    .sp         { padding-left:20px !important; padding-right:20px !important; }
    .stats-row  { grid-template-columns:1fr 1fr !important; }
  }
`;

/* ══════════════════ INNER COMPONENTS ══════════════════════════════ */

/* -- Floating stats card on hero image -- */
function HeroStatsCard({ stats }) {
  const total = stats?.total_reports ?? null;
  const crit  = stats?.critical_reports ?? null;
  const pct   = (total && total > 0) ? Math.round((crit / total) * 100) : 72;

  return (
    <div style={{
      position:'absolute', bottom:24, left:24,
      background:'rgba(5,14,8,.72)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      border:'1px solid rgba(255,255,255,.12)',
      borderRadius:18, padding:'20px 24px', minWidth:270,
    }}>
      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:11,
        color:'rgba(255,255,255,.45)', letterSpacing:'.7px',
        textTransform:'uppercase', marginBottom:6,
      }}>Total laporan masuk</p>
      <p style={{
        fontFamily:"'Syne',sans-serif", fontSize:38,
        fontWeight:700, color:'#fff', lineHeight:1, marginBottom:14,
      }}>
        {total?.toLocaleString('id') ?? '—'}
      </p>
      {/* progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{ flex:1, height:5, borderRadius:99, background:'rgba(255,255,255,.14)', overflow:'hidden' }}>
          <div style={{
            height:5, borderRadius:99,
            background:`linear-gradient(to right, ${C.lime}, #52c97a)`,
            width:`${pct}%`, transition:'width 1.4s ease',
          }}/>
        </div>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.lime, fontWeight:600, flexShrink:0 }}>
          {pct}%
        </span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.38)' }}>
          {crit ?? '—'} kasus kritis
        </span>
      </div>
      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:11,
        color:'rgba(255,255,255,.28)', marginTop:10, lineHeight:1.45,
      }}>
        Pantau seluruh laporan deforestasi Indonesia
      </p>
    </div>
  );
}

/* -- Ticker -- */
function TickerBar({ reports }) {
  const items = reports.length
    ? reports.map(r => r.title)
    : [
        'Penebangan Liar · Kalimantan Tengah',
        'Kebakaran Hutan · Riau',
        'Ekspansi Sawit · Sumatra Selatan',
        'Pembukaan Lahan Ilegal · Papua',
        'Pertambangan Liar · Sulawesi',
        'Deforestasi · Kalimantan Timur',
      ];

  const doubled = [...items, ...items];

  return (
    <div style={{
      background:'#fff',
      borderTop:'1px solid rgba(0,0,0,.07)',
      borderBottom:'1px solid rgba(0,0,0,.07)',
      padding:'17px 0',
      overflow:'hidden',
    }}>
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <span key={i} style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
            fontWeight:400, color:'#999',
            padding:'0 48px', whiteSpace:'nowrap',
            display:'inline-flex', alignItems:'center', gap:14,
          }}>
            <span style={{
              width:5, height:5, borderRadius:'50%',
              background:C.lime, display:'inline-block', flexShrink:0,
            }}/>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -- Who We Are -- */
function WhoWeAre({ stats, donation }) {
  const tags = ['Transparan', 'Aksi Nyata', 'Berbasis Data', 'Komunitas'];

  return (
    <section style={{ background:'#fff', padding:'88px 60px' }} className="sp">
      <div className="wwa-grid" style={{
        maxWidth:1200, margin:'0 auto',
        display:'grid', gridTemplateColumns:'1fr 1fr',
        gap:56, alignItems:'start',
      }}>

        {/* LEFT card – white rounded */}
        <div className="wwa-card">
          {/* Pill */}
          <span className="pill-tag">
            <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
            Tentang Platform
          </span>

          <h2 style={{
            fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:38,
            lineHeight:1.1, letterSpacing:'-.5px', color:C.textDk,
          }}>
            Digerakkan Data,<br/>Dipandu Komunitas
          </h2>

          {/* Photo with tag pills overlay */}
          <div style={{
            borderRadius:18, overflow:'hidden', height:260,
            position:'relative', flexShrink:0, background:'#c8d5c8',
          }}>
            <img
              src={IMG.wwa}
              alt="Komunitas hutan"
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
            {/* gradient overlay */}
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(to top, rgba(10,26,14,.75) 0%, transparent 55%)',
            }}/>
            {/* Tag pills */}
            <div style={{
              position:'absolute', bottom:14, left:14,
              display:'flex', flexWrap:'wrap', gap:7,
            }}>
              {tags.map(t => (
                <span key={t} style={{
                  background:'rgba(181,226,53,.93)', color:C.textDk,
                  borderRadius:99, padding:'4px 13px',
                  fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT – text */}
        <div style={{ display:'flex', flexDirection:'column', gap:22, paddingTop:10 }}>
          <p style={{
            fontFamily:"'Syne',sans-serif", fontWeight:700,
            fontSize:22, lineHeight:1.5, color:C.textDk,
          }}>
            Dengan komunitas sebagai inti, kami menghadirkan
            transparansi penuh dalam pemantauan dan pemulihan
            hutan Indonesia.
          </p>

          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:14.5,
            lineHeight:1.85, color:C.textMd, fontWeight:400,
          }}>
            HutanKita adalah jaringan intelijen publik yang menghubungkan
            masyarakat, aktivis, dan pengambil kebijakan untuk aksi nyata.
            Setiap laporan diverifikasi, dipetakan, dan ditindaklanjuti —
            karena hutan Indonesia adalah warisan kita bersama.
          </p>

          {/* Mini stats */}
          <div className="stats-row" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, paddingTop:4 }}>
            {[
              { icon:AlertTriangle, val:stats?.total_reports,                                label:'Total Laporan', col:'#f97316' },
              { icon:TreePine,      val:donation?.total_trees_planted?.toLocaleString('id'),  label:'Pohon Ditanam', col:C.greenMd },
              { icon:Users,         val:donation?.total_donors,                               label:'Relawan Aktif', col:'#0ea5e9' },
              { icon:Heart,         val:stats?.critical_reports,                              label:'Kasus Kritis',  col:'#ef4444' },
            ].map(({ icon:Icon, val, label, col }, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'13px 16px', borderRadius:14,
                background:C.offWhite, border:'1px solid rgba(0,0,0,.07)',
              }}>
                <div style={{
                  width:38, height:38, borderRadius:10,
                  background:col+'1a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  <Icon size={17} color={col}/>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color:C.textDk, lineHeight:1 }}>
                    {val ?? '—'}
                  </div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, marginTop:2 }}>
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', alignItems:'center', gap:20, paddingTop:6 }}>
            <Link to="/about" className="btn-dark">
              Pelajari Lebih
              <span className="ac"><ArrowRight size={15}/></span>
            </Link>
            <Link to="/map" style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd,
              textDecoration:'none', fontWeight:500,
              display:'flex', alignItems:'center', gap:5,
              borderBottom:`1.5px solid ${C.textLt}`, paddingBottom:2,
              transition:'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.textDk}
            onMouseLeave={e => e.currentTarget.style.color = C.textMd}
            >
              Tim Kami <ArrowUpRight size={14}/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -- Report Card -- */
function ReportCard({ r }) {
  const TI = TYPE[r.report_type]?.icon ?? MapPin;
  const tl = TYPE[r.report_type]?.label ?? r.report_type;
  const sv = SEV[r.severity] ?? SEV.low;

  return (
    <Link to={`/reports/${r.id}`} className="rcard">
      {/* Image */}
      <div style={{ position:'relative', height:200, background:'#dde4d8', flexShrink:0, overflow:'hidden' }}>
        {r.photo_url
          ? <img src={r.photo_url} alt={r.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .6s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TreePine size={44} color="rgba(0,0,0,.12)"/>
            </div>
        }
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.52) 0%,transparent 52%)' }}/>

        {/* Severity badge */}
        <div style={{
          position:'absolute', top:12, right:12,
          background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
          borderRadius:99, padding:'4px 11px',
          fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color:'#222',
          display:'flex', alignItems:'center', gap:5,
        }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:sv.dot }}/>
          {sv.label}
        </div>

        {/* Type badge */}
        <div style={{
          position:'absolute', bottom:12, left:12,
          background:'rgba(0,0,0,.58)', backdropFilter:'blur(8px)',
          borderRadius:99, padding:'4px 11px',
          fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.88)',
          display:'flex', alignItems:'center', gap:5,
        }}>
          <TI size={12}/> {tl}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'18px 20px 20px', display:'flex', flexDirection:'column', flex:1 }}>
        <h3 className="rcard-title" style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:15,
          lineHeight:1.48, color:C.textDk, transition:'color .2s',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{r.title}</h3>

        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(0,0,0,.07)' }}>
          {r.location_text && (
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:9 }}>
              <MapPin size={12} color={C.greenMd}/>
              <span style={{
                fontSize:12, color:'#aaa', fontFamily:"'DM Sans',sans-serif",
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>{r.location_text}</span>
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#ccc', fontFamily:"'DM Sans',sans-serif" }}>
              {new Date(r.created_at).toLocaleDateString('id-ID',{ day:'numeric', month:'short', year:'numeric' })}
            </span>
            <span style={{
              fontSize:12, color:C.greenMd, fontFamily:"'DM Sans',sans-serif",
              fontWeight:500, display:'flex', alignItems:'center', gap:3,
            }}>
              Detail <ArrowRight size={12}/>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* -- Recent Reports section -- */
function RecentReports({ reports }) {
  return (
    <section style={{ background:C.offWhite, padding:'80px 60px', borderTop:'1px solid rgba(0,0,0,.07)' }} className="sp">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40 }}>
          <div>
            <h2 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:38,
              color:C.textDk, letterSpacing:'-.5px', lineHeight:1.1,
            }}>Laporan Terbaru</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt, marginTop:8 }}>
              Pantauan langsung dari masyarakat di lapangan
            </p>
          </div>
          <Link to="/map" style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.greenMd,
            textDecoration:'none', fontWeight:500,
            display:'flex', alignItems:'center', gap:4,
            borderBottom:`1.5px solid ${C.greenMd}`, paddingBottom:2,
          }}>
            Semua Laporan <ArrowUpRight size={14}/>
          </Link>
        </div>

        <div className="rep-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
          {reports.length > 0
            ? reports.map(r => <ReportCard key={r.id} r={r}/>)
            : Array.from({ length:3 }).map((_, i) => (
                <div key={i} style={{
                  background:'#fff', borderRadius:20, height:350,
                  border:'1px solid rgba(0,0,0,.07)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <TreePine size={36} color="rgba(0,0,0,.1)"/>
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}

/* -- CTA Section -- */
function CTASection() {
  return (
    <section style={{ background:'#fff', padding:'64px 60px 88px' }} className="sp">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{
          background:C.green, borderRadius:28, padding:'60px 60px',
          position:'relative', overflow:'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', right:50, bottom:-80, width:200, height:200, borderRadius:'50%', background:'rgba(181,226,53,.05)', pointerEvents:'none' }}/>

          <div className="cta-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, position:'relative' }}>
            <div style={{ maxWidth:580 }}>
              <span style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.lime,
                fontWeight:600, letterSpacing:'2px', textTransform:'uppercase',
                display:'block', marginBottom:16,
              }}>Donasi Pohon</span>
              <h2 style={{
                fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:46,
                color:'#fff', lineHeight:1.1, letterSpacing:'-.5px', marginBottom:18,
              }}>
                Rp 5.000 = 1 Pohon<br/>
                <span style={{ color:C.lime }}>di Lahan Nyata</span>
              </h2>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:15,
                color:'rgba(255,255,255,.48)', lineHeight:1.8,
              }}>
                Setiap pohon dipantau melalui satelit. Donasi kamu dicatat secara
                transparan untuk lahan-lahan terdeforestasi Indonesia.
              </p>
            </div>
            <Link to="/donate" className="btn-lime" style={{ flexShrink:0, fontSize:16, padding:'14px 14px 14px 30px' }}>
              Tanam Sekarang
              <span className="ac" style={{ width:40, height:40 }}>
                <ArrowRight size={17} color={C.lime}/>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════ PAGE ═══════════════════════════════════ */
export default function HomePage() {
  const [stats,    setStats]    = useState(null);
  const [donation, setDonation] = useState(null);
  const [reports,  setReports]  = useState([]);

  useEffect(() => {
    api.get('/reports/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/donations/summary').then(r => setDonation(r.data)).catch(() => {});
    api.get('/reports?per_page=6').then(r => setReports(r.data.data || [])).catch(() => {});
  }, []);

  const total   = stats?.total_reports ?? null;
  const crit    = stats?.critical_reports ?? null;
  const pct     = (total && total > 0) ? Math.round((crit / total) * 100) : 72;

  return (
    <>
      <style>{CSS}</style>

      {/* ═══════════════ DARK GREEN HEADER ZONE ═══════════════════ */}
      <div style={{ background:C.green, position:'relative' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>

          {/* Navbar spacer (Navbar is absolute-positioned from Navbar.jsx) */}
          <div style={{ height:80 }}/>

          {/* ── HERO TEXT ROW ── */}
          <div className="hero-cols d1 fu" style={{
            display:'flex', alignItems:'flex-end',
            justifyContent:'space-between', gap:32,
            padding:'16px 40px 0',
          }}>
            {/* Big title */}
            <h1 className="hero-title" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:80, lineHeight:.98, letterSpacing:'-3px',
              color:'#fff', flex:'1 1 auto', maxWidth:660,
            }}>
              Lindungi Hutan,<br/>
              Selamatkan<br/>
              Masa Depan
            </h1>

            {/* Right: description + button */}
            <div className="d2 fu" style={{
              flexShrink:0, maxWidth:275,
              display:'flex', flexDirection:'column',
              alignItems:'flex-start', gap:22, paddingBottom:8,
            }}>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.75,
                color:'rgba(255,255,255,.52)', fontWeight:400,
              }}>
                Laporkan deforestasi, pantau titik rawan, dan ikut dalam
                restorasi hutan Indonesia bersama masyarakat penjaga lingkungan.
              </p>
              <Link to="/donate" className="btn-lime-sm">
                Donasi Pohon
                <span className="ac"><ArrowRight size={13} color={C.lime}/></span>
              </Link>
            </div>
          </div>

          {/* ── HERO IMAGE ── */}
          <div className="d3 fu" style={{ margin:'30px 20px 0', position:'relative' }}>
            <div className="hero-img-h" style={{
              height:420, borderRadius:'18px 18px 0 0',
              overflow:'hidden', position:'relative',
              background:'#1b3a2b',
            }}>
              {/* Real photo */}
              <img
                src={IMG.hero}
                alt="Hutan tropis Indonesia"
                style={{
                  width:'100%', height:'100%',
                  objectFit:'cover', display:'block',
                  objectPosition:'center center',
                }}
              />

              {/* Gradient overlay */}
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(to top, rgba(5,16,9,.72) 0%, rgba(5,16,9,.15) 45%, transparent 70%)',
              }}/>

              {/* Floating card */}
              <HeroStatsCard stats={stats}/>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════ TICKER ══════════════════════════════════ */}
      <TickerBar reports={reports}/>

      {/* ═══════════════ LIGHT SECTIONS ═════════════════════════ */}
      <WhoWeAre stats={stats} donation={donation}/>
      <RecentReports reports={reports}/>
      <CTASection/>
    </>
  );
}