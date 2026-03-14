import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  MapPin, ThumbsUp, MessageCircle, Calendar, AlertTriangle,
  ArrowLeft, X, ZoomIn, ArrowRight, Flame, Axe, Tractor,
  Hammer, TreePine, Send,
} from 'lucide-react';

if (!document.getElementById('detail-fonts')) {
  const l = document.createElement('link');
  l.id = 'detail-fonts'; l.rel = 'stylesheet';
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

const SEVERITY = {
  low:      { color:'#3b82f6', label:'Rendah',  bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6' },
  medium:   { color:'#f59e0b', label:'Sedang',  bg:'#fffbeb', text:'#b45309', dot:'#f59e0b' },
  high:     { color:'#f97316', label:'Tinggi',  bg:'#fff7ed', text:'#c2410c', dot:'#f97316' },
  critical: { color:'#ef4444', label:'Kritis',  bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444' },
};
const STATUS = {
  pending:  { bg:'#fffbeb', text:'#b45309', label:'Menunggu Verifikasi' },
  verified: { bg:'#f0fdf4', text:'#15803d', label:'Terverifikasi' },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', label:'Selesai Ditangani' },
  rejected: { bg:'#fef2f2', text:'#b91c1c', label:'Ditolak' },
};
const TYPE_MAP = {
  sawit_expansion: { icon:TreePine, label:'Ekspansi Sawit' },
  illegal_logging: { icon:Axe,      label:'Penebangan Liar' },
  forest_fire:     { icon:Flame,    label:'Kebakaran Hutan' },
  land_clearing:   { icon:Tractor,  label:'Buka Lahan' },
  mining:          { icon:Hammer,   label:'Tambang Ilegal' },
  other:           { icon:MapPin,   label:'Lainnya' },
};

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .fu  { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.06s; }
  .d2  { animation-delay:.14s; }
  .d3  { animation-delay:.22s; }
  .d4  { animation-delay:.30s; }
  .d5  { animation-delay:.38s; }

  .back-link {
    display:inline-flex; align-items:center; gap:6px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:rgba(255,255,255,.5); text-decoration:none;
    transition:color .18s; padding:6px 0;
  }
  .back-link:hover { color:rgba(255,255,255,.9); }

  .vote-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:#fff; border:1.5px solid ${C.border};
    color:${C.textMd}; padding:10px 20px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
    cursor:pointer; transition:all .2s;
  }
  .vote-btn:hover { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.04); }
  .vote-btn.voted { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.06); }

  .donate-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:${C.lime}; color:${C.textDk};
    padding:10px 10px 10px 20px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:600;
    text-decoration:none; transition:background .2s, transform .2s;
  }
  .donate-btn:hover { background:${C.limeHov}; transform:translateY(-2px); }
  .donate-btn .ac {
    width:28px; height:28px; border-radius:50%; background:${C.textDk};
    display:flex; align-items:center; justify-content:center;
  }

  .comment-input {
    flex:1; background:${C.offWhite}; border:1.5px solid ${C.border};
    border-radius:99px; padding:11px 20px;
    font-family:'DM Sans',sans-serif; font-size:13.5px; color:${C.textDk};
    outline:none; transition:border-color .2s, background .2s;
  }
  .comment-input:focus { border-color:${C.greenMd}; background:#fff; }
  .comment-input::placeholder { color:${C.textLt}; }

  .send-btn {
    width:42px; height:42px; border-radius:50%; flex-shrink:0;
    background:${C.green}; color:#fff; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:background .2s, transform .2s;
  }
  .send-btn:hover { background:${C.greenMd}; transform:scale(1.06); }
  .send-btn:disabled { opacity:.4; cursor:not-allowed; }

  @media (max-width:640px) {
    .hero-inner   { padding:16px 20px 40px !important; }
    .hero-title   { font-size:36px !important; letter-spacing:-1px !important; }
    .content-wrap { padding:0 20px !important; }
    .stat-grid    { grid-template-columns:1fr !important; }
  }
`;

function PhotoModal({ src, alt, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(0,0,0,.92)', backdropFilter:'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <button onClick={onClose} style={{
        position:'absolute', top:20, right:20,
        background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)',
        borderRadius:'50%', width:40, height:40,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', color:'#fff',
      }}><X size={18}/></button>
      <img src={src} alt={alt} onClick={e => e.stopPropagation()}
        style={{ maxWidth:'100%', maxHeight:'88vh', objectFit:'contain', borderRadius:16 }}/>
      <p style={{
        position:'absolute', bottom:18,
        fontFamily:"'DM Sans',sans-serif", fontSize:12,
        color:'rgba(255,255,255,.28)',
      }}>
        Tekan <kbd style={{ background:'rgba(255,255,255,.1)', padding:'2px 7px', borderRadius:5 }}>Esc</kbd> untuk menutup
      </p>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const [report,    setReport]    = useState(null);
  const [comment,   setComment]   = useState('');
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);
  const [showPhoto, setShowPhoto] = useState(false);

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

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:C.offWhite }}>
        <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.greenMd, animation:'spin 1s linear infinite' }}/>
      </div>
    </>
  );
  if (!report) return (
    <>
      <style>{CSS}</style>
      <div style={{ textAlign:'center', paddingTop:120, fontFamily:"'DM Sans',sans-serif", color:C.textLt, background:C.offWhite, minHeight:'100vh' }}>
        Laporan tidak ditemukan.
      </div>
    </>
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

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <div style={{ background:C.green, position:'relative', overflow:'hidden' }}>
        {/* Decorative */}
        <div style={{ position:'absolute', right:-60, top:-60, width:260, height:260, borderRadius:'50%', background:'rgba(181,226,53,.06)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ height:80 }}/>
          <div className="hero-inner fu d1" style={{ padding:'16px 40px 44px' }}>

            <Link to="/map" className="back-link" style={{ marginBottom:18, display:'inline-flex' }}>
              <ArrowLeft size={13}/> Kembali ke Peta
            </Link>

            {/* Badges row */}
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:16 }}>
              <span style={{
                background:st.bg, color:st.text,
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600,
              }}>{st.label}</span>

              <span style={{
                background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:500,
                display:'flex', alignItems:'center', gap:5,
              }}>
                <TIcon size={11}/> {ti.label}
              </span>

              <span style={{
                background:'rgba(255,255,255,.1)',
                borderRadius:99, padding:'4px 12px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                display:'flex', alignItems:'center', gap:5,
                color:'rgba(255,255,255,.7)',
              }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:sv.dot, display:'inline-block' }}/>
                Tingkat {sv.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="hero-title" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:48, lineHeight:1.02, letterSpacing:'-1.8px',
              color:'#fff', marginBottom:16, maxWidth:680,
            }}>{report.title}</h1>

            {/* Meta */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:18 }}>
              {report.location_text && (
                <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.45)' }}>
                  <MapPin size={12} color={C.lime}/> {report.location_text}
                </span>
              )}
              <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.45)' }}>
                <Calendar size={12}/>
                {new Date(report.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
              </span>
              {report.user?.name && (
                <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.45)' }}>
                  Dilaporkan oleh
                  <strong style={{ color:'rgba(255,255,255,.7)', fontWeight:600 }}>{report.user.name}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════ */}
      <div style={{ background:C.offWhite, padding:'32px 0 88px' }}>
        <div className="content-wrap" style={{ maxWidth:800, margin:'0 auto', padding:'0 40px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* ── Foto ── */}
          {report.photo_url && (
            <div className="fu d2" onClick={() => setShowPhoto(true)} style={{
              position:'relative', height:360, borderRadius:24,
              overflow:'hidden', cursor:'zoom-in', background:C.green,
              boxShadow:'0 8px 32px rgba(0,0,0,.1)',
            }}>
              <img
                src={report.photo_url} alt={report.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s ease' }}
                onMouseEnter={e => e.target.style.transform='scale(1.03)'}
                onMouseLeave={e => e.target.style.transform='scale(1)'}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.3) 0%,transparent 50%)' }}/>
              <div style={{
                position:'absolute', bottom:14, right:14,
                background:'rgba(255,255,255,.88)', backdropFilter:'blur(8px)',
                borderRadius:99, padding:'6px 14px',
                display:'flex', alignItems:'center', gap:6,
                fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textMd,
              }}>
                <ZoomIn size={12}/> Perbesar
              </div>
            </div>
          )}

          {/* ── Deskripsi ── */}
          <div className="fu d2" style={{ background:'#fff', borderRadius:22, padding:'28px 32px', border:`1px solid ${C.border}` }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, fontWeight:700, letterSpacing:'.9px', textTransform:'uppercase', marginBottom:14 }}>
              Deskripsi Laporan
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:C.textMd, lineHeight:1.9 }}>
              {report.description}
            </p>
          </div>

          {/* ── Stat cards ── */}
          {(report.area_affected || report.trees_lost) && (
            <div className="stat-grid fu d3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {report.area_affected && (
                <div style={{
                  background:'#fff7ed', border:'1px solid #fed7aa',
                  borderRadius:22, padding:'28px 24px', textAlign:'center',
                }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#9a3412', fontWeight:700, letterSpacing:'.9px', textTransform:'uppercase', marginBottom:10 }}>Luas Terdampak</p>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:52, fontWeight:800, color:'#f97316', lineHeight:1 }}>{report.area_affected}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#c2410c', marginTop:6 }}>Hektar</p>
                </div>
              )}
              {report.trees_lost && (
                <div style={{
                  background:'#fef2f2', border:'1px solid #fecaca',
                  borderRadius:22, padding:'28px 24px', textAlign:'center',
                }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#991b1b', fontWeight:700, letterSpacing:'.9px', textTransform:'uppercase', marginBottom:10 }}>Pohon Hilang</p>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:52, fontWeight:800, color:'#ef4444', lineHeight:1 }}>{report.trees_lost?.toLocaleString('id')}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#b91c1c', marginTop:6 }}>Pohon</p>
                </div>
              )}
            </div>
          )}

          {/* ── Action bar ── */}
          <div className="fu d3" style={{
            background:'#fff', borderRadius:22, padding:'18px 24px',
            border:`1px solid ${C.border}`,
            display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
          }}>
            <button onClick={vote} className="vote-btn">
              <ThumbsUp size={15}/>
              <span>{report.upvotes}</span>
              <span style={{ color:C.textLt, fontWeight:400 }}>Vote</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6, color:C.textLt, fontFamily:"'DM Sans',sans-serif", fontSize:13.5 }}>
              <MessageCircle size={15}/>
              {report.comments?.length || 0} komentar
            </div>
            <div style={{ flex:1 }}/>
            <Link to="/donate" className="donate-btn">
              🌱 Tanam Pohon di Sini
              <span className="ac"><ArrowRight size={12} color={C.lime}/></span>
            </Link>
          </div>

          {/* ── Komentar ── */}
          <div className="fu d4">
            <h3 style={{
              fontFamily:"'Syne',sans-serif", fontSize:19, fontWeight:700,
              color:C.textDk, marginBottom:14,
            }}>
              Komentar
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:400, color:C.textLt, marginLeft:8 }}>
                {report.comments?.length || 0}
              </span>
            </h3>

            {/* Input komentar di atas — sosmed style */}
            {user && (
              <form onSubmit={submitComment} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                {/* Avatar */}
                <div style={{
                  width:38, height:38, borderRadius:'50%', flexShrink:0,
                  background:C.green, display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:C.lime,
                }}>
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tulis komentarmu..."
                  className="comment-input"
                />
                <button type="submit" className="send-btn" disabled={submitting || !comment.trim()}>
                  <Send size={15}/>
                </button>
              </form>
            )}

            {/* List komentar */}
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {report.comments?.length > 0
                ? report.comments.map((c, idx) => (
                    <div key={c.id} className="fu" style={{
                      animationDelay:`${.05 * idx}s`,
                      display:'flex', gap:12, padding:'14px 0',
                      borderBottom: idx < report.comments.length - 1 ? `1px solid ${C.border}` : 'none',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width:36, height:36, borderRadius:'50%', flexShrink:0,
                        background:C.green, display:'flex', alignItems:'center',
                        justifyContent:'center',
                        fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.lime,
                      }}>
                        {c.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, color:C.textDk }}>
                            {c.user?.name || 'Anonim'}
                          </span>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                            {new Date(c.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}
                          </span>
                        </div>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd, lineHeight:1.7 }}>
                          {c.body}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                  <div style={{ padding:'28px 0', textAlign:'center' }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
                      Belum ada komentar. Jadilah yang pertama! 💬
                    </p>
                  </div>
                )
              }
            </div>

            {!user && (
              <div style={{
                marginTop:14, background:'#fff', borderRadius:18,
                border:`1px solid ${C.border}`, padding:'18px 22px',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
              }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd }}>
                  Login untuk ikut berkomentar
                </p>
                <Link to="/login" style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.greenMd,
                  fontWeight:600, textDecoration:'none',
                  borderBottom:`1.5px solid ${C.greenMd}`, paddingBottom:1,
                }}>Masuk</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}