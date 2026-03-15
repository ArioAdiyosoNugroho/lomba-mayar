import { useEffect, useState } from 'react';
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
  pending:  { bg:'#fffbeb', text:'#b45309', label:'Menunggu Verifikasi' },
  verified: { bg:'#f0fdf4', text:'#15803d', label:'✓ Terverifikasi' },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', label:'Selesai Ditangani' },
  rejected: { bg:'#fef2f2', text:'#b91c1c', label:'Ditolak' },
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
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.offWhite}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse-lime{0%,100%{box-shadow:0 0 0 0 rgba(181,226,53,.55)}60%{box-shadow:0 0 0 7px rgba(181,226,53,0)}}
  .fu{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}
  .d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.22s}.d4{animation-delay:.3s}

  .back-link{display:inline-flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,.5);text-decoration:none;transition:color .18s}
  .back-link:hover{color:rgba(255,255,255,.9)}

  /* Action pills — ala sosmed */
  .action-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid ${C.border};color:${C.textMd};padding:9px 16px;border-radius:99px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;text-decoration:none;-webkit-tap-highlight-color:transparent}
  .action-pill:hover{border-color:${C.greenMd};color:${C.greenMd}}
  .action-pill.voted{border-color:${C.greenMd};color:${C.greenMd};background:rgba(45,106,79,.06)}

  .donate-btn{display:inline-flex;align-items:center;gap:8px;background:${C.lime};color:${C.textDk};padding:10px 10px 10px 18px;border-radius:99px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;text-decoration:none;transition:background .2s,transform .2s;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .donate-btn:hover{background:${C.limeHov};transform:translateY(-1px)}
  .donate-btn .ac{width:26px;height:26px;border-radius:50%;background:${C.textDk};display:flex;align-items:center;justify-content:center}

  .comment-input{flex:1;background:${C.offWhite};border:1.5px solid ${C.border};border-radius:99px;padding:11px 18px;font-family:'DM Sans',sans-serif;font-size:14px;color:${C.textDk};outline:none;transition:border-color .2s,background .2s;min-width:0}
  .comment-input:focus{border-color:${C.greenMd};background:#fff}
  .comment-input::placeholder{color:${C.textLt}}

  .send-btn{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:${C.green};color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .2s}
  .send-btn:hover{background:${C.greenMd};transform:scale(1.06)}
  .send-btn:disabled{opacity:.4;cursor:not-allowed}

  /* Mobile sticky footer donasi */
  .mob-donate-bar{
    position:fixed;bottom:0;left:0;right:0;z-index:100;
    display:none;
    background:#fff;border-top:1px solid ${C.border};
    padding:12px 16px env(safe-area-inset-bottom,12px);
    box-shadow:0 -8px 32px rgba(0,0,0,.1);
  }
  .mob-donate-btn{
    display:flex;align-items:center;justify-content:center;gap:10px;
    background:${C.lime};color:${C.textDk};
    padding:14px 14px 14px 24px;border-radius:99px;width:100%;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;
    border:none;cursor:pointer;text-decoration:none;
    transition:background .2s;-webkit-tap-highlight-color:transparent;
  }
  .mob-donate-btn:hover{background:${C.limeHov}}
  .mob-donate-btn .ic{width:38px;height:38px;border-radius:50%;background:${C.textDk};flex-shrink:0;display:flex;align-items:center;justify-content:center}

  /* Two column layout */
  .detail-layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start}

  /* Responsive */
  @media(max-width:1024px){
    .detail-layout{grid-template-columns:1fr!important}
    .sidebar{display:none!important}
  }
  @media(max-width:768px){
    .mob-donate-bar{display:block!important}
    .hero-inner{padding:14px 16px 0!important}
    .hero-title{font-size:30px!important;letter-spacing:-1px!important;line-height:1.05!important}
    .hero-img-h{height:220px!important;border-radius:14px 14px 0 0!important}
    .content-wrap{padding:0 14px!important}
    .content-pb{padding-bottom:80px!important}
    .action-bar{flex-wrap:wrap!important;gap:8px!important}
    .action-bar-right{width:100%!important}
    .donate-btn-full{width:100%!important;justify-content:center!important}
    .stat-cards{grid-template-columns:1fr 1fr!important}
    .stat-num{font-size:36px!important}
  }
`;

function PhotoModal({ src, alt, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.92)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <button onClick={onClose} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
        <X size={18}/>
      </button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()} style={{ maxWidth:'100%', maxHeight:'88vh', objectFit:'contain', borderRadius:16 }}/>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const [report,     setReport]    = useState(null);
  const [comment,    setComment]   = useState('');
  const [loading,    setLoading]   = useState(true);
  const [submitting, setSubmitting]= useState(false);
  const [showPhoto,  setShowPhoto] = useState(false);
  const [showDetail, setShowDetail]= useState(false); // mobile collapsible detail

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
    e.preventDefault();
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
    toast.success('Link disalin!');
  };

  if (loading) return (
    <><style>{CSS}</style>
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:C.offWhite }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.greenMd, animation:'spin 1s linear infinite' }}/>
    </div></>
  );
  if (!report) return (
    <><style>{CSS}</style>
    <div style={{ textAlign:'center', paddingTop:120, fontFamily:"'DM Sans',sans-serif", color:C.textLt, background:C.offWhite, minHeight:'100vh' }}>
      Laporan tidak ditemukan.
    </div></>
  );

  const sv    = SEVERITY[report.severity] ?? SEVERITY.low;
  const st    = STATUS[report.status]     ?? STATUS.pending;
  const ti    = TYPE_MAP[report.report_type] ?? TYPE_MAP.other;
  const TIcon = ti.icon;

  return (
    <>
      <style>{CSS}</style>
      {showPhoto && report.photo_url && (
        <PhotoModal src={report.photo_url} alt={report.title} onClose={() => setShowPhoto(false)}/>
      )}

      {/* ══ HERO ══ */}
      <div style={{ background:C.green, position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:16 }}/>
          <div className="hero-inner fu d1" style={{ padding:'14px 60px 0' }}>

            <Link to="/map" className="back-link" style={{ marginBottom:16, display:'inline-flex' }}>
              <ArrowLeft size={13}/> Kembali ke Peta
            </Link>

            {/* Badges */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              <span style={{ background:st.bg, color:st.text, borderRadius:99, padding:'4px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{st.label}</span>
              <span style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:99, padding:'4px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                <TIcon size={10}/> {ti.label}
              </span>
              <span style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', borderRadius:99, padding:'4px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:sv.color, display:'inline-block' }}/>{sv.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="hero-title" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:52, lineHeight:.97, letterSpacing:'-2px', color:'#fff', marginBottom:14, maxWidth:720 }}>
              {report.title}
            </h1>

            {/* Meta */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
              {report.location_text && (
                <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'rgba(255,255,255,.42)' }}>
                  <MapPin size={11} color={C.lime}/> {report.location_text}
                </span>
              )}
              <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'rgba(255,255,255,.42)' }}>
                <Calendar size={11}/>
                {new Date(report.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
              </span>
              {report.user?.name && (
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'rgba(255,255,255,.42)' }}>
                  oleh <strong style={{ color:'rgba(255,255,255,.65)' }}>{report.user.name}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Hero image */}
          {report.photo_url ? (
            <div className="fu d2" style={{ margin:'20px 20px 0', cursor:'zoom-in' }} onClick={() => setShowPhoto(true)}>
              <div className="hero-img-h" style={{ height:340, borderRadius:'18px 18px 0 0', overflow:'hidden', position:'relative', background:'#0f2318' }}>
                <img src={report.photo_url} alt={report.title}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .6s ease' }}
                  onMouseEnter={e => e.target.style.transform='scale(1.03)'}
                  onMouseLeave={e => e.target.style.transform='scale(1)'}
                />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,16,9,.55) 0%,transparent 55%)' }}/>
                <div style={{ position:'absolute', bottom:14, right:14, background:'rgba(255,255,255,.88)', backdropFilter:'blur(8px)', borderRadius:99, padding:'5px 12px', display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textMd }}>
                  <ZoomIn size={11}/> Perbesar
                </div>
                <div style={{ position:'absolute', top:14, left:14, background:'rgba(5,14,8,.72)', backdropFilter:'blur(12px)', border:`1px solid ${sv.color}44`, borderRadius:99, padding:'5px 12px', display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:sv.color, animation:'pulse-lime 2s infinite', display:'inline-block' }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'#fff', fontWeight:500 }}>Tingkat {sv.label}</span>
                </div>
              </div>
            </div>
          ) : <div style={{ height:24 }}/>}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ background:C.offWhite, paddingTop:24, paddingBottom:88 }} className="content-pb">
        <div className="content-wrap" style={{ maxWidth:1160, margin:'0 auto', padding:'0 60px' }}>
          <div className="detail-layout fu d3">

            {/* ── Main column ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>

              {/* ── Pelapor info — mobile only (sebelum action bar) ── */}
              {report.user && (
                <div style={{ display:'none' }} className="mob-reporter">
                  <style>{`@media(max-width:768px){.mob-reporter{display:flex!important;align-items:center;gap:10px;background:#fff;border-radius:16px;padding:14px 16px;border:1px solid ${C.border}}}`}</style>
                  <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0, background:C.green, border:`2px solid ${C.lime}33`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:C.lime }}>
                    {report.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, color:C.textDk }}>{report.user.name}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt, marginTop:1 }}>Pelapor {report.user.total_trees_planted > 0 ? `· 🌱 ${report.user.total_trees_planted} pohon` : ''}</p>
                  </div>
                </div>
              )}

              {/* ── Action bar — sosmed style ── */}
              <div className="action-bar" style={{ background:'#fff', borderRadius:18, padding:'12px 18px', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8, flexWrap:'nowrap', overflowX:'auto' }}>
                <button onClick={vote} className={`action-pill${report.upvotes > 0?' voted':''}`} style={{ flexShrink:0 }}>
                  <ThumbsUp size={14}/> <span style={{ fontWeight:600 }}>{report.upvotes}</span>
                </button>
                <div className="action-pill" style={{ cursor:'default', flexShrink:0 }}>
                  <MessageCircle size={14}/> {report.comments?.length || 0}
                </div>
                <button onClick={share} className="action-pill" style={{ flexShrink:0 }}>
                  <Share2 size={14}/> Bagikan
                </button>
                <div style={{ flex:1 }}/>
                <Link to="/donate" className="donate-btn action-bar-right donate-btn-full" style={{ flexShrink:0 }}>
                  🌱 Tanam Pohon
                  <span className="ac"><ArrowRight size={11} color={C.lime}/></span>
                </Link>
              </div>

              {/* ── Detail info — mobile collapsible (pola DonatePage) ── */}
              <div style={{ display:'none' }} className="mob-detail-card">
                <style>{`@media(max-width:768px){.mob-detail-card{display:block!important;background:#fff;border-radius:16px;border:1px solid ${C.border};overflow:hidden}}`}</style>
                <button type="button" onClick={() => setShowDetail(s => !s)}
                  style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'none', border:'none', cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <span style={{ background:sv.bg, color:sv.text, borderRadius:99, padding:'3px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{sv.label}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>{ti.label}</span>
                  </div>
                  <ChevronDown size={16} color={C.textLt} style={{ transition:'transform .25s', transform:showDetail?'rotate(180deg)':'rotate(0deg)', flexShrink:0 }}/>
                </button>
                {showDetail && (
                  <div style={{ borderTop:`1px solid ${C.border}`, padding:'14px 18px' }}>
                    {[
                      { label:'Status',   value:st.label, color:STATUS[report.status]?.text, bg:STATUS[report.status]?.bg },
                      { label:'Jenis',    value:ti.label },
                      { label:'Tingkat',  value:sv.label, color:sv.text, bg:sv.bg },
                      { label:'Tanggal',  value:new Date(report.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) },
                      report.location_text && { label:'Lokasi', value:report.location_text },
                      report.lat && { label:'Koordinat', value:`${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}` },
                    ].filter(Boolean).map(({ label, value, color, bg }) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>{label}</span>
                        {color ? (
                          <span style={{ background:bg, color, borderRadius:99, padding:'2px 9px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{value}</span>
                        ) : (
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C.textDk, textAlign:'right', maxWidth:200 }}>{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Deskripsi ── */}
              <div style={{ background:'#fff', borderRadius:18, padding:'22px 24px', border:`1px solid ${C.border}` }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Deskripsi</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:C.textMd, lineHeight:1.9 }}>
                  {report.description}
                </p>
              </div>

              {/* ── Stats cards ── */}
              {(report.area_affected || report.trees_lost) && (
                <div className="stat-cards" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {report.area_affected && (
                    <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:18, padding:'20px', textAlign:'center' }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:'#9a3412', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Luas Terdampak</p>
                      <p className="stat-num" style={{ fontFamily:"'Syne',sans-serif", fontSize:44, fontWeight:800, color:'#f97316', lineHeight:1 }}>{report.area_affected}</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#c2410c', marginTop:4 }}>Hektar</p>
                    </div>
                  )}
                  {report.trees_lost && (
                    <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:18, padding:'20px', textAlign:'center' }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:'#991b1b', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:8 }}>Pohon Hilang</p>
                      <p className="stat-num" style={{ fontFamily:"'Syne',sans-serif", fontSize:44, fontWeight:800, color:'#ef4444', lineHeight:1 }}>{report.trees_lost?.toLocaleString('id')}</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#b91c1c', marginTop:4 }}>Pohon</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Komentar ── */}
              <div style={{ background:'#fff', borderRadius:18, padding:'20px 22px', border:`1px solid ${C.border}` }}>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.textDk, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
                  <MessageCircle size={17} color={C.greenMd}/>
                  Komentar
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:400, color:C.textLt }}>({report.comments?.length || 0})</span>
                </h3>

                {user ? (
                  <form onSubmit={submitComment} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:18 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.lime }}>
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Tulis komentarmu..." className="comment-input"/>
                    <button type="submit" className="send-btn" disabled={submitting || !comment.trim()}><Send size={14}/></button>
                  </form>
                ) : (
                  <div style={{ background:C.offWhite, borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, border:`1px solid ${C.border}` }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textMd }}>Login untuk berkomentar</p>
                    <Link to="/login" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.greenMd, fontWeight:600, textDecoration:'none' }}>Masuk →</Link>
                  </div>
                )}

                {report.comments?.length > 0 ? report.comments.map((c, idx) => (
                  <div key={c.id} style={{ display:'flex', gap:10, padding:'12px 0', borderTop:idx>0?`1px solid ${C.border}`:'none' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:C.lime }}>
                      {c.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, color:C.textDk }}>{c.user?.name || 'Anonim'}</span>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt }}>
                          {new Date(c.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}
                        </span>
                      </div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd, lineHeight:1.7 }}>{c.body}</p>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign:'center', padding:'20px 0' }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>Belum ada komentar. Jadilah yang pertama! 💬</p>
                  </div>
                )}
              </div>

            </div>

            {/* ── Sidebar desktop ── */}
            <div className="sidebar" style={{ display:'flex', flexDirection:'column', gap:14, position:'sticky', top:96 }}>

              {report.user && (
                <div className="fu d3" style={{ background:'#fff', borderRadius:22, padding:'20px', border:`1px solid ${C.border}` }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Pelapor</p>
                  <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                    <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0, background:C.green, border:`2px solid ${C.lime}33`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:C.lime }}>
                      {report.user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:C.textDk }}>{report.user.name}</p>
                      {report.user.total_trees_planted > 0 && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt, marginTop:2 }}>🌱 {report.user.total_trees_planted} pohon</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="fu d3" style={{ background:'#fff', borderRadius:22, padding:'20px', border:`1px solid ${C.border}` }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>Detail</p>
                {[
                  { label:'Jenis',   value:ti.label },
                  { label:'Tingkat', value:sv.label, color:sv.text, bg:sv.bg },
                  { label:'Status',  value:st.label, color:STATUS[report.status]?.text, bg:STATUS[report.status]?.bg },
                  { label:'Tanggal', value:new Date(report.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) },
                  report.location_text && { label:'Lokasi', value:report.location_text },
                ].filter(Boolean).map(({ label, value, color, bg }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>{label}</span>
                    {color ? (
                      <span style={{ background:bg, color, borderRadius:99, padding:'2px 9px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{value}</span>
                    ) : (
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C.textDk, textAlign:'right', maxWidth:150 }}>{value}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="fu d4" style={{ background:C.green, borderRadius:22, padding:'22px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', right:-28, top:-28, width:110, height:110, borderRadius:'50%', background:'rgba(181,226,53,.08)', pointerEvents:'none' }}/>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.lime, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8, position:'relative' }}>Ambil Aksi</p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:19, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:8, position:'relative' }}>
                  Pulihkan hutan<br/><span style={{ color:C.lime }}>dengan donasi</span>
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,.42)', lineHeight:1.7, marginBottom:16, position:'relative' }}>
                  Rp 5.000 = 1 pohon ditanam di lahan terdeforestasi.
                </p>
                <Link to="/donate" className="donate-btn" style={{ width:'100%', justifyContent:'center', position:'relative' }}>
                  Donasi Sekarang <span className="ac"><ArrowRight size={11} color={C.lime}/></span>
                </Link>
              </div>

              {report.lat && report.lng && (
                <div className="fu d4" style={{ background:'#fff', borderRadius:22, padding:'20px', border:`1px solid ${C.border}` }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>Koordinat</p>
                  <div style={{ display:'flex', gap:8 }}>
                    {[['Latitude', report.lat], ['Longitude', report.lng]].map(([l, v]) => (
                      <div key={l} style={{ flex:1, background:C.offWhite, borderRadius:11, padding:'9px 12px', textAlign:'center' }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLt, marginBottom:2 }}>{l}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.textDk }}>{Number(v).toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ══ MOBILE STICKY FOOTER DONASI — sama pola DonatePage ══ */}
      <div className="mob-donate-bar">
        <Link to="/donate" className="mob-donate-btn">
            Tanam Pohon di Sini
          <span className="ic"><ArrowRight size={15} color={C.lime}/></span>
        </Link>
      </div>
    </>
  );
}