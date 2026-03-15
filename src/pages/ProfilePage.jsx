import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  TreePine, FileText, Heart, ArrowRight,
  MapPin, CheckCircle, Clock, XCircle,
} from 'lucide-react';

if (!document.getElementById('prof-fonts')) {
  const l = document.createElement('link');
  l.id = 'prof-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

const C = {
  green   : '#1b3a2b',
  greenMd : '#2d6a4f',
  lime    : '#b5e235',
  offWhite: '#f5f5f0',
  textDk  : '#0f1a10',
  textMd  : '#4a5544',
  textLt  : '#8a9984',
  border  : 'rgba(0,0,0,.08)',
};

const STATUS_DON = {
  paid    : { bg:'#f0fdf4', text:'#15803d', dot:'#16a34a', label:'Lunas'    },
  pending : { bg:'#fffbeb', text:'#b45309', dot:'#f59e0b', label:'Menunggu' },
  failed  : { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', label:'Gagal'    },
  expired : { bg:'#f5f5f5', text:'#6b7280', dot:'#9ca3af', label:'Expired'  },
};
const STATUS_REP = {
  pending  : { bg:'#fffbeb', text:'#b45309', dot:'#f59e0b', label:'Menunggu',      Icon:Clock        },
  verified : { bg:'#f0fdf4', text:'#15803d', dot:'#16a34a', label:'Terverifikasi', Icon:CheckCircle  },
  resolved : { bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6', label:'Selesai',       Icon:CheckCircle  },
  rejected : { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', label:'Ditolak',       Icon:XCircle      },
};

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .fu  { animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.06s; }
  .d2  { animation-delay:.14s; }
  .d3  { animation-delay:.22s; }

  /* ── Tabs ── */
  .tab-pill {
    display:flex; align-items:center; gap:7px;
    padding:9px 20px; border-radius:99px; border:none;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
    cursor:pointer; transition:all .18s; white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .tab-pill.active   { background:${C.green}; color:#fff; }
  .tab-pill.inactive { background:transparent; color:${C.textLt}; }
  .tab-pill.inactive:hover { background:rgba(0,0,0,.05); color:${C.textDk}; }

  /* ── Rows ── */
  .don-row {
    display:flex; align-items:center; gap:14px;
    background:#fff; border:1px solid ${C.border};
    border-radius:18px; padding:14px 18px;
    transition:box-shadow .2s;
  }
  .don-row:hover { box-shadow:0 6px 20px rgba(0,0,0,.07); }

  .rep-row {
    display:flex; align-items:flex-start; gap:14px;
    background:#fff; border:1px solid ${C.border};
    border-radius:18px; padding:14px 18px;
    text-decoration:none; color:inherit;
    transition:transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .rep-row:hover  { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,0,0,.07); }
  .rep-row:active { transform:scale(.98); }

  /* ── CTA button ── */
  .btn-lime {
    display:inline-flex; align-items:center; gap:8px;
    background:${C.lime}; color:${C.textDk};
    padding:11px 11px 11px 22px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px;
    text-decoration:none; border:none; cursor:pointer;
    transition:background .2s, transform .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-lime:hover  { background:#c8f24d; transform:translateY(-2px); }
  .btn-lime:active { transform:scale(.97); }
  .btn-lime .ac {
    width:30px; height:30px; border-radius:50%;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }

  /* ── Responsive ── */
  @media (max-width:640px) {
    .hero-h1      { font-size:36px !important; letter-spacing:-1.2px !important; }
    .hero-row     { flex-direction:column !important; align-items:flex-start !important; gap:20px !important; }
    .stat-grid    { grid-template-columns:1fr 1fr !important; gap:10px !important; }
    .page-wrap    { padding:20px 14px 64px !important; }
    .hero-pad     { padding:16px 20px 32px !important; }
    .avatar-sz    { width:68px !important; height:68px !important; font-size:28px !important; }
    .tab-row      { width:100% !important; justify-content:stretch !important; }
    .tab-pill     { flex:1 !important; justify-content:center !important; font-size:13px !important; padding:9px 14px !important; }
    .don-row      { padding:12px 14px !important; border-radius:14px !important; gap:12px !important; }
    .rep-row      { padding:12px 14px !important; border-radius:14px !important; gap:12px !important; }
    .don-amount   { font-size:14px !important; }
    .hero-stat-v  { font-size:22px !important; }
    .rep-title    { font-size:13.5px !important; }
  }
`;

/* ── Badge chip ── */
function StatusBadge({ cfg }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:cfg.bg, color:cfg.text,
      borderRadius:99, padding:'3px 10px', flexShrink:0,
      fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600,
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot }}/>
      {cfg.label}
    </span>
  );
}

/* ── Avatar ── */
function Avatar({ initial, size = 88, fontSize = 36 }) {
  return (
    <div className="avatar-sz" style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(135deg,${C.greenMd},${C.green})`,
      border:'3px solid rgba(181,226,53,.35)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Syne',sans-serif", fontSize, fontWeight:800, color:C.lime,
      boxShadow:'0 8px 28px rgba(0,0,0,.28)',
    }}>
      {initial}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { user }             = useAuth();
  const [donations, setDon]  = useState([]);
  const [reports,   setRep]  = useState([]);
  const [tab,       setTab]  = useState('donations');
  const [loading,   setLoad] = useState(true);
  const [error,     setErr]  = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoad(true); setErr(null);
    Promise.all([
      api.get('/donations/my'),
      api.get(`/reports?user_id=${user.id}&per_page=50`),
    ]).then(([d, r]) => {
      const dons = d.data?.data || d.data || [];
      setDon(Array.isArray(dons) ? dons : []);
      const reps = r.data?.data || r.data || [];
      const mine = Array.isArray(reps)
        ? reps.filter(x => !x.user_id || x.user_id === user.id || x.user?.id === user.id)
        : [];
      setRep(mine);
      setLoad(false);
    }).catch(() => { setErr('Gagal memuat data.'); setLoad(false); });
  }, [user]);

  const initials   = user?.name?.[0]?.toUpperCase() || '?';
  const totalTrees = donations
    .filter(d => d.status === 'paid')
    .reduce((s, d) => s + (d.trees_count || 0), 0);

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', right:-80, top:-80, width:300, height:300,
          borderRadius:'50%', background:'rgba(181,226,53,.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:-40, bottom:-40, width:200, height:200,
          borderRadius:'50%', background:'rgba(181,226,53,.04)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-pad" style={{ padding:'20px 60px 48px' }}>

            {/* Top row: avatar + name + stats */}
            <div className="hero-row" style={{ display:'flex', alignItems:'flex-end',
              justifyContent:'space-between', gap:28, flexWrap:'wrap' }}>

              {/* Avatar + name */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:20 }}>
                <Avatar initial={initials}/>
                <div style={{ paddingBottom:4 }}>
                  {/* Member badge */}
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:6,
                    background:'rgba(181,226,53,.14)', border:'1px solid rgba(181,226,53,.22)',
                    borderRadius:99, padding:'4px 12px', marginBottom:10,
                  }}>
                    <span style={{ width:5, height:5, borderRadius:'50%',
                      background:C.lime, display:'inline-block',
                      boxShadow:`0 0 8px ${C.lime}` }}/>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:11.5, color:C.lime, fontWeight:600 }}>
                      Member Aktif
                    </span>
                  </div>
                  <h1 className="hero-h1" style={{
                    fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:50,
                    lineHeight:.96, letterSpacing:'-2px', color:'#fff',
                  }}>{user?.name}</h1>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                    color:'rgba(255,255,255,.38)', marginTop:8 }}>{user?.email}</p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="stat-grid" style={{
                display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12,
              }}>
                {[
                  { val: totalTrees || user?.total_trees_planted || 0, label:'Pohon Ditanam', color:C.lime         },
                  { val: donations.length,                              label:'Total Donasi',  color:'#fbbf24'      },
                  { val: reports.length,                                label:'Laporan',       color:'#60a5fa'      },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{
                    background:'rgba(255,255,255,.07)',
                    border:'1px solid rgba(255,255,255,.1)',
                    borderRadius:16, padding:'16px 14px', textAlign:'center',
                  }}>
                    <p className="hero-stat-v" style={{ fontFamily:"'Syne',sans-serif",
                      fontSize:26, fontWeight:800, color, lineHeight:1 }}>{val}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
                      color:'rgba(255,255,255,.36)', marginTop:5 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'28px 60px 80px' }}>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:12, padding:'12px 16px', marginBottom:18,
              color:'#b91c1c', fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
              {error}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="fu d2 tab-row" style={{
            display:'inline-flex', gap:4,
            background:'#fff', border:`1px solid ${C.border}`,
            borderRadius:99, padding:5, marginBottom:22,
          }}>
            {[
              { key:'donations', label:'Riwayat Donasi', Icon:Heart    },
              { key:'reports',   label:'Laporan',   Icon:FileText },
            ].map(({ key, label, Icon }) => (
              <button key={key}
                className={`tab-pill ${tab===key?'active':'inactive'}`}
                onClick={() => setTab(key)}>
                <Icon size={14}/>
                {label}
                <span style={{
                  background: tab===key ? 'rgba(255,255,255,.2)' : C.border,
                  borderRadius:99, padding:'1px 7px',
                  fontSize:11, fontWeight:700,
                }}>
                  {key==='donations' ? donations.length : reports.length}
                </span>
              </button>
            ))}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ width:36, height:36, borderRadius:'50%',
                border:`3px solid ${C.border}`, borderTopColor:C.greenMd,
                animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:C.textLt, fontSize:13 }}>
                Memuat data…
              </p>
            </div>
          )}

          {/* ══ TAB: DONASI ══ */}
          {!loading && tab === 'donations' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {donations.length === 0 ? (
                <EmptyState
                  icon={<TreePine size={40} color="rgba(0,0,0,.1)"/>}
                  title="Belum ada donasi"
                  desc="Tanam pohon pertamamu dan bantu pulihkan hutan Indonesia."
                  cta={{ to:'/donate', label:'Donasi Pohon' }}
                />
              ) : donations.map(d => {
                const st = STATUS_DON[d.status] ?? STATUS_DON.pending;
                return (
                  <div key={d.id} className="don-row">
                    {/* Icon */}
                    <div style={{ width:46, height:46, borderRadius:13, flexShrink:0,
                      background:'#f0fdf4', border:'1px solid #bbf7d0',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <TreePine size={20} color={C.greenMd}/>
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5,
                        fontWeight:600, color:C.textDk, marginBottom:3 }}>
                        {d.trees_count} pohon
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                        {new Date(d.created_at).toLocaleDateString('id-ID',
                          { day:'numeric', month:'short', year:'numeric' })}
                        {d.mayar_order_id && (
                          <span style={{ marginLeft:8, opacity:.45 }}>
                            #{d.mayar_order_id?.slice(-6)}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Amount + status */}
                    <div style={{ textAlign:'right', flexShrink:0, display:'flex',
                      flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                      <p className="don-amount" style={{ fontFamily:"'Syne',sans-serif",
                        fontSize:16, fontWeight:700, color:C.textDk }}>
                        {d.amount_formatted || `Rp ${d.amount?.toLocaleString('id')}`}
                      </p>
                      <StatusBadge cfg={st}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ TAB: LAPORAN ══ */}
          {!loading && tab === 'reports' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {reports.length === 0 ? (
                <EmptyState
                  icon={<FileText size={40} color="rgba(0,0,0,.1)"/>}
                  title="Belum ada laporan"
                  desc="Laporkan deforestasi yang kamu temukan di sekitarmu."
                  cta={{ to:'/report', label:'Buat Laporan' }}
                />
              ) : reports.map(r => {
                const st = STATUS_REP[r.status] ?? STATUS_REP.pending;
                const { Icon: StIcon } = st;
                return (
                  <Link key={r.id} to={`/reports/${r.id}`} className="rep-row">
                    {/* Status icon */}
                    <div style={{ width:46, height:46, borderRadius:13, flexShrink:0,
                      background:st.bg, border:`1px solid ${st.text}22`,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <StIcon size={18} color={st.text}/>
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="rep-title" style={{ fontFamily:"'DM Sans',sans-serif",
                        fontSize:14.5, fontWeight:600, color:C.textDk, marginBottom:5,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.title}
                      </p>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                        {r.location_text && (
                          <span style={{ display:'flex', alignItems:'center', gap:4,
                            fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                            <MapPin size={11} color={C.greenMd}/> {r.location_text}
                          </span>
                        )}
                        <span style={{ fontFamily:"'DM Sans',sans-serif",
                          fontSize:12, color:C.textLt }}>
                          {new Date(r.created_at).toLocaleDateString('id-ID',
                            { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{ flexShrink:0 }}>
                      <StatusBadge cfg={st}/>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ── Empty state ── */
function EmptyState({ icon, title, desc, cta }) {
  return (
    <div style={{ background:'#fff', borderRadius:22, border:`1px solid ${C.border}`,
      padding:'52px 28px', textAlign:'center' }}>
      <div style={{ marginBottom:14 }}>{icon}</div>
      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700,
        color:C.textDk, marginBottom:8 }}>{title}</p>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
        color:C.textLt, marginBottom:22, lineHeight:1.6 }}>{desc}</p>
      <Link to={cta.to} className="btn-lime">
        {cta.label}
        <span className="ac"><ArrowRight size={13} color={C.lime}/></span>
      </Link>
    </div>
  );
}