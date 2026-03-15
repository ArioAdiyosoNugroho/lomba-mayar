import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MapPin, ThumbsUp, MessageCircle, Calendar, ArrowLeft,
  X, ZoomIn, ArrowRight, Flame, Axe, Tractor,
  Hammer, TreePine, Send, Share2, ChevronDown,
} from 'lucide-react';

if (!document.getElementById('detail-fonts')) {
  const l = document.createElement('link');
  l.id = 'detail-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

const C = {
  green:'#1b3a2b', greenMd:'#2d6a4f', lime:'#b5e235', limeHov:'#c8f24d',
  offWhite:'#f5f5f0', textDk:'#0f1a10', textMd:'#4a5544', textLt:'#8a9984',
  border:'rgba(0,0,0,.08)',
};

const SEVERITY = {
  low:      { color:'#3b82f6', label:'Rendah',  bg:'#eff6ff', text:'#1d4ed8' },
  medium:   { color:'#f59e0b', label:'Sedang',  bg:'#fffbeb', text:'#b45309' },
  high:     { color:'#f97316', label:'Tinggi',  bg:'#fff7ed', text:'#c2410c' },
  critical: { color:'#ef4444', label:'Kritis',  bg:'#fef2f2', text:'#b91c1c' },
};
const STATUS = {
  pending:  { bg:'#fffbeb', text:'#b45309', dot:'#f59e0b', label:'Menunggu Verifikasi' },
  verified: { bg:'#f0fdf4', text:'#15803d', dot:'#16a34a', label:'Terverifikasi' },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6', label:'Selesai Ditangani' },
  rejected: { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', label:'Ditolak' },
};
const TYPE_MAP = {
  sawit_expansion:{ icon:TreePine, label:'Ekspansi Sawit' },
  illegal_logging:{ icon:Axe,     label:'Penebangan Liar' },
  forest_fire:    { icon:Flame,   label:'Kebakaran Hutan' },
  land_clearing:  { icon:Tractor, label:'Buka Lahan' },
  mining:         { icon:Hammer,  label:'Tambang Ilegal' },
  other:          { icon:MapPin,  label:'Lainnya' },
};

const CSS = `
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulseDot { 0%,100%{box-shadow:0 0 0 0 rgba(181,226,53,.55)} 60%{box-shadow:0 0 0 6px rgba(181,226,53,0)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .fu  { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.06s; }
  .d2  { animation-delay:.14s; }
  .d3  { animation-delay:.22s; }
  .d4  { animation-delay:.30s; }

  /* ── Back link ── */
  .back-link {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:rgba(255,255,255,.5); text-decoration:none; transition:color .18s; padding:6px 0;
  }
  .back-link:hover { color:rgba(255,255,255,.9); }

  /* ── Action pills ── */
  .action-pill {
    display:inline-flex; align-items:center; gap:7px;
    background:#fff; border:1.5px solid ${C.border};
    color:${C.textMd}; padding:9px 16px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    cursor:pointer; transition:all .18s; text-decoration:none; white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .action-pill:hover  { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.04); }
  .action-pill:active { transform:scale(.97); }
  .action-pill.voted  { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.06); }

  /* ── Donate button ── */
  .donate-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:${C.lime}; color:${C.textDk};
    padding:10px 10px 10px 20px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
    text-decoration:none; transition:background .2s,transform .2s; border:none; cursor:pointer;
    -webkit-tap-highlight-color:transparent;
  }
  .donate-btn:hover  { background:${C.limeHov}; transform:translateY(-2px); }
  .donate-btn:active { transform:scale(.97); }
  .donate-btn .ac {
    width:28px; height:28px; border-radius:50%; background:${C.textDk};
    display:flex; align-items:center; justify-content:center;
  }

  /* ── Comment input ── */
  .comment-input {
    flex:1; background:${C.offWhite}; border:1.5px solid ${C.border};
    border-radius:99px; padding:11px 20px;
    font-family:'DM Sans',sans-serif; font-size:14px; color:${C.textDk};
    outline:none; transition:border-color .2s,background .2s;
    -webkit-appearance:none;
  }
  .comment-input:focus { border-color:${C.greenMd}; background:#fff; }
  .comment-input::placeholder { color:${C.textLt}; }

  .send-btn {
    width:44px; height:44px; border-radius:50%; flex-shrink:0;
    background:${C.green}; color:#fff; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:background .2s,transform .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .send-btn:hover    { background:${C.greenMd}; transform:scale(1.06); }
  .send-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

  /* ── Mobile sticky comment bar ── */
  .mob-comment-bar {
    position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:#fff; padding:10px 14px env(safe-area-inset-bottom,12px);
    border-top:1px solid ${C.border};
    box-shadow:0 -4px 20px rgba(0,0,0,.08);
    display:none;
  }

  /* ── Sidebar card ── */
  .side-card {
    background:#fff; border-radius:20px;
    border:1px solid ${C.border}; padding:22px;
  }
  .side-label {
    font-family:'DM Sans',sans-serif; font-size:10.5px; color:${C.textLt};
    font-weight:700; letter-spacing:'1px'; text-transform:uppercase; margin-bottom:14px;
    letter-spacing:1px;
  }

  /* ── Layout ── */
  .detail-layout {
    display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start;
  }

  /* ── Responsive ── */
  @media (max-width:1024px) {
    .detail-layout { grid-template-columns:1fr !important; }
    .sidebar-col   { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  }
  @media (max-width:640px) {
    .hero-inner    { padding:12px 16px 0 !important; }
    .hero-title    { font-size:30px !important; letter-spacing:-1px !important; line-height:1.1 !important; }
    .content-wrap  { padding:0 14px !important; }
    .action-bar    { gap:8px !important; padding:10px 14px !important; overflow-x:auto !important; flex-wrap:nowrap !important; }
    .action-pill   { padding:8px 12px !important; font-size:12.5px !important; }
    .desc-card     { padding:20px 18px !important; }
    .stats-grid    { grid-template-columns:1fr 1fr !important; }
    .comment-card  { padding:18px 16px 80px !important; }
    /* Show sticky comment bar on mobile */
    .mob-comment-bar { display:block !important; }
    /* Hide inline comment form on mobile */
    .desk-comment-form { display:none !important; }
    /* Sidebar: single column on small mobile */
    .sidebar-col   { grid-template-columns:1fr !important; }
    /* Hide sidebar on mobile, show inline details */
    .sidebar-col   { display:none !important; }
    /* Show mobile info cards */
    .mob-info      { display:block !important; }
    .detail-layout { gap:0 !important; }
  }
`;

/* ── Photo modal ── */
function PhotoModal({ src, alt, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,.94)', backdropFilter:'blur(12px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <button onClick={onClose} style={{
        position:'absolute', top:20, right:20,
        background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)',
        borderRadius:'50%', width:40, height:40,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', color:'#fff',
      }}>
        <X size={18}/>
      </button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()}
        style={{ maxWidth:'100%', maxHeight:'88vh', objectFit:'contain', borderRadius:16 }}/>
      <p style={{ position:'absolute', bottom:18,
        fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,.3)' }}>
        Tekan <kbd style={{ background:'rgba(255,255,255,.1)', padding:'2px 7px', borderRadius:5 }}>Esc</kbd> untuk menutup
      </p>
    </div>
  );
}

/* ── Avatar circle ── */
function Avatar({ name, size = 36, green = false }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background: green ? C.green : C.offWhite,
      border: green ? '2px solid rgba(181,226,53,.25)' : `1px solid ${C.border}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Syne',sans-serif", fontSize:size*.38, fontWeight:800,
      color: green ? C.lime : C.greenMd,
    }}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function ReportDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const commentInputRef = useRef(null);

  const [report,     setReport]     = useState(null);
  const [comment,    setComment]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPhoto,  setShowPhoto]  = useState(false);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(r => { setReport(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const vote = async () => {
    if (!user) { toast.error('Login untuk memberi vote.'); return; }
    try {
      const res = await api.post(`/reports/${id}/vote`);
      setReport(r => ({ ...r, upvotes: res.data.upvotes }));
      toast.success(res.data.message);
    } catch { toast.error('Gagal vote.'); }
  };

  const submitComment = async (e) => {
    e?.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/reports/${id}/comments`, { body: comment });
      setReport(r => ({ ...r, comments: [...(r.comments || []), res.data.comment] }));
      setComment('');
      toast.success('Komentar ditambahkan.');
    } catch { toast.error('Gagal mengirim komentar.'); }
    finally { setSubmitting(false); }
  };

  const share = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link disalin! 🔗');
  };

  /* ── Loading ── */
  if (loading) return (
    <><style>{CSS}</style>
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
      minHeight:'100vh', background:C.offWhite }}>
      <div style={{ width:44, height:44, borderRadius:'50%',
        border:`3px solid ${C.border}`, borderTopColor:C.greenMd,
        animation:'spin 1s linear infinite' }}/>
    </div></>
  );

  if (!report) return (
    <><style>{CSS}</style>
    <div style={{ textAlign:'center', paddingTop:120, fontFamily:"'DM Sans',sans-serif",
      color:C.textLt, background:C.offWhite, minHeight:'100vh' }}>
      Laporan tidak ditemukan.
    </div></>
  );

  const sv    = SEVERITY[report.severity]    ?? SEVERITY.low;
  const st    = STATUS[report.status]        ?? STATUS.pending;
  const ti    = TYPE_MAP[report.report_type] ?? TYPE_MAP.other;
  const TIcon = ti.icon;

  /* ── Inline detail rows for mobile ── */
  const detailRows = [
    { label:'Jenis',    value:ti.label },
    { label:'Tingkat',  value:sv.label,  color:sv.text,  bg:sv.bg  },
    { label:'Status',   value:st.label,  color:st.text,  bg:st.bg  },
    { label:'Tanggal',  value:new Date(report.created_at).toLocaleDateString('id-ID',
        { day:'numeric', month:'long', year:'numeric' }) },
    report.location_text && { label:'Lokasi', value:report.location_text },
  ].filter(Boolean);

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>
      {showPhoto && report.photo_url && (
        <PhotoModal src={report.photo_url} alt={report.title} onClose={() => setShowPhoto(false)}/>
      )}

      {/* ════════════════ HERO ════════════════ */}
      <div style={{ background:C.green, position:'relative', overflow:'hidden' }}>
        {/* Subtle blobs */}
        <div style={{ position:'absolute', right:-60, top:-60, width:260, height:260,
          borderRadius:'50%', background:'rgba(181,226,53,.06)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1140, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:12 }}/>
          <div className="hero-inner fu d1" style={{ padding:'16px 60px 0' }}>

            {/* Back */}
            <Link to="/map" className="back-link" style={{ marginBottom:18, display:'inline-flex' }}>
              <ArrowLeft size={13}/> Kembali ke Peta
            </Link>

            {/* Badges row */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:16 }}>
              {/* Status */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                background:st.bg, color:st.text,
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot }}/>
                {st.label}
              </span>
              {/* Type */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5 }}>
                <TIcon size={11}/> {ti.label}
              </span>
              {/* Severity */}
              <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%',
                  background:sv.color, animation:'pulseDot 2s infinite', display:'inline-block' }}/>
                Tingkat {sv.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="hero-title" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:52,
              lineHeight:1.0, letterSpacing:'-2px', color:'#fff',
              marginBottom:16, maxWidth:720,
            }}>
              {report.title}
            </h1>

            {/* Meta */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:14, paddingBottom:0 }}>
              {report.user?.name && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Avatar name={report.user.name} size={26} green/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                    color:'rgba(255,255,255,.5)' }}>
                    <strong style={{ color:'rgba(255,255,255,.75)', fontWeight:600 }}>
                      {report.user.name}
                    </strong>
                  </span>
                </div>
              )}
              {report.location_text && (
                <span style={{ display:'flex', alignItems:'center', gap:5,
                  fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.45)' }}>
                  <MapPin size={12} color={C.lime}/> {report.location_text}
                </span>
              )}
              <span style={{ display:'flex', alignItems:'center', gap:5,
                fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.4)' }}>
                <Calendar size={12}/>
                {new Date(report.created_at).toLocaleDateString('id-ID',
                  { day:'numeric', month:'long', year:'numeric' })}
              </span>
            </div>
          </div>

          {/* Hero photo */}
          {report.photo_url ? (
            <div className="fu d2" style={{ margin:'22px 20px 0', cursor:'zoom-in' }}
              onClick={() => setShowPhoto(true)}>
              <div style={{ height:380, borderRadius:'18px 18px 0 0',
                overflow:'hidden', position:'relative', background:'#0f2318' }}>
                <img src={report.photo_url} alt={report.title}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
                    transition:'transform .5s ease' }}
                  onMouseEnter={e => e.target.style.transform='scale(1.03)'}
                  onMouseLeave={e => e.target.style.transform='scale(1)'}
                />
                <div style={{ position:'absolute', inset:0,
                  background:'linear-gradient(to top,rgba(5,16,9,.55) 0%,transparent 55%)' }}/>
                {/* Zoom hint */}
                <div style={{ position:'absolute', bottom:16, right:16,
                  background:'rgba(255,255,255,.88)', backdropFilter:'blur(8px)',
                  borderRadius:99, padding:'6px 14px',
                  display:'flex', alignItems:'center', gap:6,
                  fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textMd }}>
                  <ZoomIn size={12}/> Perbesar
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height:28 }}/>
          )}
        </div>
      </div>

      {/* ════════════════ CONTENT ════════════════ */}
      <div style={{ background:C.offWhite, padding:'24px 0 100px' }}>
        <div className="content-wrap" style={{ maxWidth:1140, margin:'0 auto', padding:'0 60px' }}>
          <div className="detail-layout fu d3">

            {/* ══ LEFT: main content ══ */}
            <div style={{ display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>

              {/* ── Action bar (social style) ── */}
              <div className="action-bar" style={{
                background:'#fff', borderRadius:20,
                padding:'12px 18px', border:`1px solid ${C.border}`,
                display:'flex', alignItems:'center', gap:10,
              }}>
                <button onClick={vote} className={`action-pill${report.upvotes > 0 ? ' voted' : ''}`}>
                  <ThumbsUp size={14}/>
                  <span style={{ fontWeight:700 }}>{report.upvotes || 0}</span>
                  Dukung
                </button>
                <div className="action-pill" style={{ cursor:'default' }}>
                  <MessageCircle size={14}/> {report.comments?.length || 0}
                </div>
                <button onClick={share} className="action-pill">
                  <Share2 size={14}/> Bagikan
                </button>
                <div style={{ flex:1 }}/>
                <Link to="/donate" className="donate-btn">
                  🌱 Tanam Pohon
                  <span className="ac"><ArrowRight size={12} color={C.lime}/></span>
                </Link>
              </div>

              {/* ── Mobile: detail info inline ── */}
              <div className="mob-info" style={{ display:'none', background:'#fff',
                borderRadius:20, padding:'18px 16px', border:`1px solid ${C.border}` }}>
                <p className="side-label">Detail Laporan</p>
                {detailRows.map(({ label, value, color, bg }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'9px 0',
                    borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:12.5, color:C.textLt }}>{label}</span>
                    {color ? (
                      <span style={{ background:bg, color, borderRadius:99, padding:'2px 10px',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                        {value}
                      </span>
                    ) : (
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                        fontWeight:500, color:C.textDk, textAlign:'right', maxWidth:180 }}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Description ── */}
              <div className="desc-card" style={{
                background:'#fff', borderRadius:20,
                padding:'26px 28px', border:`1px solid ${C.border}`,
              }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt,
                  fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:14 }}>
                  Deskripsi Laporan
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15.5,
                  color:C.textMd, lineHeight:1.9 }}>
                  {report.description}
                </p>
              </div>

              {/* ── Stats cards ── */}
              {(report.area_affected || report.trees_lost) && (
                <div className="stats-grid" style={{
                  display:'grid',
                  gridTemplateColumns: (report.area_affected && report.trees_lost) ? '1fr 1fr' : '1fr',
                  gap:12,
                }}>
                  {report.area_affected && (
                    <div style={{ background:'#fff7ed', border:'1px solid #fed7aa',
                      borderRadius:20, padding:'22px', textAlign:'center' }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
                        color:'#9a3412', fontWeight:700, letterSpacing:'1px',
                        textTransform:'uppercase', marginBottom:10 }}>Luas Terdampak</p>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:46,
                        fontWeight:800, color:'#f97316', lineHeight:1 }}>
                        {report.area_affected}
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        color:'#c2410c', marginTop:5 }}>Hektar</p>
                    </div>
                  )}
                  {report.trees_lost && (
                    <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
                      borderRadius:20, padding:'22px', textAlign:'center' }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
                        color:'#991b1b', fontWeight:700, letterSpacing:'1px',
                        textTransform:'uppercase', marginBottom:10 }}>Pohon Hilang</p>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:46,
                        fontWeight:800, color:'#ef4444', lineHeight:1 }}>
                        {report.trees_lost?.toLocaleString('id')}
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        color:'#b91c1c', marginTop:5 }}>Pohon</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Mobile: coordinates ── */}
              {report.lat && report.lng && (
                <div className="mob-info" style={{ display:'none', background:'#fff',
                  borderRadius:20, padding:'18px 16px', border:`1px solid ${C.border}` }}>
                  <p className="side-label">Koordinat</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['Latitude', report.lat], ['Longitude', report.lng]].map(([l, v]) => (
                      <div key={l} style={{ background:C.offWhite, borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLt, marginBottom:3 }}>{l}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:C.textDk }}>
                          {Number(v).toFixed(4)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Mobile: donate CTA ── */}
              <div className="mob-info" style={{ display:'none', background:C.green,
                borderRadius:20, padding:'22px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:-24, top:-24, width:100, height:100,
                  borderRadius:'50%', background:'rgba(181,226,53,.08)', pointerEvents:'none' }}/>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.lime,
                  fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
                  marginBottom:8, position:'relative' }}>Ambil Aksi</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700,
                  color:'#fff', lineHeight:1.25, marginBottom:8, position:'relative' }}>
                  Pulihkan hutan<br/><span style={{ color:C.lime }}>dengan donasi</span>
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                  color:'rgba(255,255,255,.4)', lineHeight:1.7, marginBottom:16, position:'relative' }}>
                  Rp 5.000 = 1 pohon ditanam atas namamu.
                </p>
                <Link to="/donate" className="donate-btn"
                  style={{ width:'100%', justifyContent:'center', position:'relative' }}>
                  🌱 Donasi Sekarang
                  <span className="ac"><ArrowRight size={12} color={C.lime}/></span>
                </Link>
              </div>

              {/* ── Comments ── */}
              <div className="comment-card" style={{
                background:'#fff', borderRadius:20,
                padding:'22px 24px', border:`1px solid ${C.border}`,
              }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:18,
                  display:'flex', alignItems:'center', gap:8 }}>
                  <MessageCircle size={18} color={C.greenMd}/>
                  Komentar
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                    fontWeight:400, color:C.textLt }}>
                    ({report.comments?.length || 0})
                  </span>
                </h3>

                {/* Desktop comment form */}
                {user ? (
                  <form className="desk-comment-form" onSubmit={submitComment}
                    style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22 }}>
                    <Avatar name={user.name} size={38} green/>
                    <input value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Tulis komentarmu..." className="comment-input"/>
                    <button type="submit" className="send-btn"
                      disabled={submitting || !comment.trim()}>
                      <Send size={15}/>
                    </button>
                  </form>
                ) : (
                  <div className="desk-comment-form" style={{
                    background:C.offWhite, borderRadius:14, padding:'14px 18px',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    marginBottom:22, border:`1px solid ${C.border}`,
                  }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd }}>
                      Login untuk berkomentar
                    </p>
                    <Link to="/login" style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.greenMd,
                      fontWeight:600, textDecoration:'none',
                      borderBottom:`1.5px solid ${C.greenMd}`, paddingBottom:1,
                    }}>Masuk</Link>
                  </div>
                )}

                {/* Comment list */}
                {report.comments?.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                    {report.comments.map((c, idx) => (
                      <div key={c.id} style={{
                        display:'flex', gap:12, padding:'14px 0',
                        borderTop: idx > 0 ? `1px solid ${C.border}` : 'none',
                      }}>
                        <Avatar name={c.user?.name} size={36} green/>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                            <span style={{ fontFamily:"'DM Sans',sans-serif",
                              fontSize:13.5, fontWeight:600, color:C.textDk }}>
                              {c.user?.name || 'Anonim'}
                            </span>
                            <span style={{ fontFamily:"'DM Sans',sans-serif",
                              fontSize:11.5, color:C.textLt }}>
                              {new Date(c.created_at).toLocaleDateString('id-ID',
                                { day:'numeric', month:'short' })}
                            </span>
                          </div>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                            color:C.textMd, lineHeight:1.75 }}>
                            {c.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'28px 0' }}>
                    <MessageCircle size={32} color="rgba(0,0,0,.1)" style={{ marginBottom:10 }}/>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
                      Belum ada komentar. Jadilah yang pertama! 💬
                    </p>
                  </div>
                )}
              </div>

            </div>
            {/* END LEFT */}

            {/* ══ RIGHT: sidebar ══ */}
            <div className="sidebar-col" style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Reporter */}
              {report.user && (
                <div className="side-card fu d3">
                  <p className="side-label">Pelapor</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Avatar name={report.user.name} size={46} green/>
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                        fontWeight:600, color:C.textDk }}>{report.user.name}</p>
                      {report.user.total_trees_planted > 0 && (
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                          color:C.textLt, marginTop:2 }}>
                          🌱 {report.user.total_trees_planted} pohon ditanam
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Detail info */}
              <div className="side-card fu d3">
                <p className="side-label">Detail Laporan</p>
                {detailRows.map(({ label, value, color, bg }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', padding:'9px 0',
                    borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",
                      fontSize:12.5, color:C.textLt, flexShrink:0 }}>{label}</span>
                    {color ? (
                      <span style={{ background:bg, color, borderRadius:99, padding:'2px 10px',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                        {value}
                      </span>
                    ) : (
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                        fontWeight:500, color:C.textDk, textAlign:'right', maxWidth:160 }}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Koordinat */}
              {report.lat && report.lng && (
                <div className="side-card fu d4">
                  <p className="side-label">Koordinat</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[['Latitude', report.lat], ['Longitude', report.lng]].map(([l, v]) => (
                      <div key={l} style={{ background:C.offWhite, borderRadius:12,
                        padding:'10px 14px', textAlign:'center' }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
                          color:C.textLt, marginBottom:3 }}>{l}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:14,
                          fontWeight:700, color:C.textDk }}>{Number(v).toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Donate CTA */}
              <div className="fu d4" style={{
                background:C.green, borderRadius:20, padding:'24px',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', right:-28, top:-28,
                  width:120, height:120, borderRadius:'50%',
                  background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.lime,
                  fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase',
                  marginBottom:10, position:'relative' }}>Ambil Aksi</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700,
                  color:'#fff', lineHeight:1.2, marginBottom:10, position:'relative' }}>
                  Pulihkan hutan<br/><span style={{ color:C.lime }}>dengan donasi</span>
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                  color:'rgba(255,255,255,.42)', lineHeight:1.7, marginBottom:18, position:'relative' }}>
                  Rp 5.000 = 1 pohon ditanam di lahan terdeforestasi.
                </p>
                <Link to="/donate" className="donate-btn"
                  style={{ width:'100%', justifyContent:'center', position:'relative' }}>
                  🌱 Donasi Sekarang
                  <span className="ac"><ArrowRight size={12} color={C.lime}/></span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ════════════════ MOBILE STICKY COMMENT BAR ════════════════ */}
      <div className="mob-comment-bar">
        {user ? (
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar name={user.name} size={36} green/>
            <input
              ref={commentInputRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Tulis komentar…"
              className="comment-input"
              style={{ fontSize:14 }}
            />
            <button className="send-btn"
              onClick={submitComment}
              disabled={submitting || !comment.trim()}>
              <Send size={15}/>
            </button>
          </div>
        ) : (
          <Link to="/login" style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            background:C.offWhite, border:`1.5px solid ${C.border}`,
            borderRadius:99, padding:'12px 20px', width:'100%',
            fontFamily:"'DM Sans',sans-serif", fontSize:14,
            color:C.textMd, textDecoration:'none', fontWeight:500,
          }}>
            <MessageCircle size={16} color={C.textLt}/>
            Login untuk berkomentar
          </Link>
        )}
      </div>
    </>
  );
}