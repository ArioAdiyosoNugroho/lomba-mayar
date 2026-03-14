import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Locate, AlertTriangle, ArrowRight, X, Info, MapPin, FileText, Tag, Camera } from 'lucide-react';

if (!document.getElementById('report-fonts')) {
  const l = document.createElement('link');
  l.id = 'report-fonts'; l.rel = 'stylesheet';
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

const TYPES = [
  { value:'sawit_expansion', label:'Ekspansi Sawit',  emoji:'🌴' },
  { value:'illegal_logging', label:'Penebangan Liar', emoji:'🪓' },
  { value:'forest_fire',     label:'Kebakaran',       emoji:'🔥' },
  { value:'land_clearing',   label:'Buka Lahan',      emoji:'🚜' },
  { value:'mining',          label:'Tambang',         emoji:'⛏️' },
  { value:'other',           label:'Lainnya',         emoji:'📍' },
];

const SEVERITIES = [
  { value:'low',      label:'Rendah',  color:'#3b82f6', bg:'#eff6ff' },
  { value:'medium',   label:'Sedang',  color:'#f59e0b', bg:'#fffbeb' },
  { value:'high',     label:'Tinggi',  color:'#f97316', bg:'#fff7ed' },
  { value:'critical', label:'Kritis',  color:'#ef4444', bg:'#fef2f2' },
];

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1 { animation-delay:.06s; }
  .d2 { animation-delay:.14s; }

  .f-label {
    display:block; font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:600;
    color:${C.textLt}; letter-spacing:.6px; text-transform:uppercase; margin-bottom:7px;
  }
  .f-input {
    width:100%; background:${C.offWhite}; border:2px solid ${C.border};
    border-radius:12px; padding:13px 16px; font-family:'DM Sans',sans-serif;
    font-size:14px; color:${C.textDk}; outline:none;
    transition:border-color .18s, background .18s, box-shadow .18s;
  }
  .f-input:focus { border-color:${C.greenMd}; background:#fff; box-shadow:0 0 0 4px rgba(45,106,79,.08); }
  .f-input::placeholder { color:${C.textLt}; }
  .f-input.err { border-color:#ef4444; }

  .f-select {
    width:100%; background:${C.offWhite}; border:2px solid ${C.border};
    border-radius:12px; padding:13px 40px 13px 16px; font-family:'DM Sans',sans-serif;
    font-size:14px; color:${C.textDk}; outline:none; cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%238a9984' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 14px center;
    transition:border-color .18s, background .18s;
  }
  .f-select:focus { border-color:${C.greenMd}; background:#fff; outline:none; }

  .type-btn {
    padding:12px 8px; border-radius:12px; border:2px solid ${C.border};
    background:#fff; cursor:pointer; text-align:center; transition:all .18s;
  }
  .type-btn:hover  { border-color:${C.greenMd}; background:rgba(45,106,79,.03); }
  .type-btn.active { border-color:${C.green}; background:${C.green}; }

  .sev-btn {
    flex:1; padding:12px 6px; border-radius:12px;
    border:2px solid ${C.border}; background:#fff;
    cursor:pointer; text-align:center; transition:all .18s;
  }
  .sev-btn:hover { transform:translateY(-1px); }
  .sev-btn.active { border-width:2px; }

  .geo-btn {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(45,106,79,.09); color:${C.greenMd};
    border:none; border-radius:99px; padding:8px 14px; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600;
    transition:background .18s;
  }
  .geo-btn:hover   { background:rgba(45,106,79,.15); }
  .geo-btn:disabled { opacity:.4; }

  .s-card {
    background:#fff; border-radius:20px; border:1px solid ${C.border}; padding:24px 26px;
  }
  .s-icon-title {
    display:flex; align-items:center; gap:10px; margin-bottom:20px;
  }
  .s-icon {
    width:36px; height:36px; border-radius:10px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .s-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:${C.textDk}; }

  .btn-submit {
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:15px 15px 15px 26px; border-radius:99px; width:100%;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:15px;
    border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
  }
  .btn-submit:hover:not(:disabled) {
    background:${C.limeHov}; transform:translateY(-2px);
    box-shadow:0 12px 32px rgba(181,226,53,.35);
  }
  .btn-submit:disabled { opacity:.45; cursor:not-allowed; }
  .btn-submit .ic {
    width:40px; height:40px; border-radius:50%; background:${C.textDk}; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; transition:transform .2s;
  }
  .btn-submit:hover:not(:disabled) .ic { transform:translateX(3px); }

  .err-msg { font-family:'DM Sans',sans-serif; font-size:12px; color:#ef4444; margin-top:5px; }

  @media (max-width:1024px) {
    .report-grid { grid-template-columns:1fr !important; }
    .right-sticky { position:static !important; }
    .hero-content { padding:20px 28px 52px !important; }
  }
  @media (max-width:600px) {
    .hero-content { padding:20px 20px 44px !important; }
    .hero-title   { font-size:44px !important; letter-spacing:-1.5px !important; }
    .hero-stats   { gap:20px !important; }
    .page-wrap    { padding:24px 16px 64px !important; }
    .type-grid    { grid-template-columns:repeat(3,1fr) !important; }
    .sev-row      { flex-wrap:wrap !important; }
    .coord-row    { grid-template-columns:1fr !important; }
  }
`;

export default function ReportPage() {
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [photo,      setPhoto]      = useState(null);
  const [errors,     setErrors]     = useState({});

  const [form, setForm] = useState({
    title:'', description:'', lat:'', lng:'',
    location_text:'', report_type:'sawit_expansion',
    severity:'medium', area_affected:'', trees_lost:'',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolokasi tidak didukung.');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        set('lat', pos.coords.latitude.toFixed(6));
        set('lng', pos.coords.longitude.toFixed(6));
        setGeoLoading(false);
        toast.success('Lokasi terdeteksi! 📍');
      },
      () => { setGeoLoading(false); toast.error('Gagal mendeteksi lokasi.'); }
    );
  };

  const handlePhoto = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Foto maksimal 5 MB.'); return; }
    setPhoto(f); setPreview(URL.createObjectURL(f));
  };

  const submit = async e => {
    e.preventDefault(); setErrors({}); setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    if (photo) fd.append('photo', photo);
    try {
      const res = await api.post('/reports', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success('Laporan terkirim! 🌿');
      navigate(`/reports/${res.data.report.id}`);
    } catch (err) {
      if (err.response?.status === 422) { setErrors(err.response.data.errors); toast.error('Ada kesalahan pada form.'); }
      else toast.error('Gagal mengirim laporan.');
    } finally { setLoading(false); }
  };

  const activeSev = SEVERITIES.find(s => s.value === form.severity);

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO dengan foto background ══════════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:320, background:C.green }}>

        {/* Foto hutan */}
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 35%',
            display:'block',
          }}
        />

        {/* Overlay gradient kiri→kanan */}
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
        <div style={{ position:'absolute', right:-60, top:-60, width:320, height:320, borderRadius:'50%', background:'rgba(239,68,68,.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:140, bottom:50, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(239,68,68,.10)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:185, bottom:85, width:70, height:70, borderRadius:'50%', border:'1px solid rgba(239,68,68,.15)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'40%', top:28, width:5, height:5, borderRadius:'50%', background:'rgba(181,226,53,.3)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'55%', bottom:44, width:4, height:4, borderRadius:'50%', background:'rgba(181,226,53,.2)', pointerEvents:'none' }}/>

        {/* Content */}
        <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-content" style={{
            padding:'20px 60px 56px',
            display:'flex', alignItems:'flex-end',
            justifyContent:'space-between', gap:32, flexWrap:'wrap',
          }}>
            <div>
              {/* Badge */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:7,
                background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.22)',
                borderRadius:99, padding:'5px 14px', marginBottom:18,
              }}>
                <AlertTriangle size={12} color='#f87171'/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#f87171', fontWeight:600 }}>
                  Laporan Kerusakan Hutan
                </span>
              </div>

              {/* Judul */}
              <h1 className="hero-title" style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:64, lineHeight:.96, letterSpacing:'-2.5px', color:'#fff',
              }}>
                Buat Laporan,<br/>
                <span style={{ color:C.lime }}>Sekarang</span>
              </h1>

              {/* Stats bar */}
              <div className="hero-stats" style={{ display:'flex', gap:32, marginTop:28, flexWrap:'wrap' }}>
                {[
                  { v:'12.400+', l:'Laporan Terkirim' },
                  { v:'87%',     l:'Ditindaklanjuti' },
                  { v:'3.200+',  l:'Relawan Aktif' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:C.lime, lineHeight:1 }}>{v}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'rgba(255,255,255,.42)', marginTop:4 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanan: deskripsi */}
            <p className="fu d2" style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.85,
              color:'rgba(255,255,255,.48)', maxWidth:255, paddingBottom:6,
            }}>
              Laporkan kerusakan yang kamu temukan. Setiap laporan diverifikasi dan ditindaklanjuti oleh tim kami.
            </p>
          </div>
        </div>
      </div>

      {/* ══ TWO-COLUMN FORM ═════════════════════════════════════════ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'36px 60px 80px' }}>
          <form onSubmit={submit}>
            <div className="report-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>

              {/* ── LEFT: Form fields ── */}
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

                {/* Judul + Deskripsi */}
                <div className="s-card fu d1">
                  <div className="s-icon-title">
                    <div className="s-icon" style={{ background:'rgba(27,58,43,.08)' }}>
                      <FileText size={17} color={C.greenMd}/>
                    </div>
                    <span className="s-title">Informasi Utama</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div>
                      <label className="f-label">Judul Laporan <span style={{ color:'#ef4444' }}>*</span></label>
                      <input value={form.title} onChange={e => set('title', e.target.value)}
                        placeholder="Contoh: Pembukaan lahan sawit ilegal di Kalimantan Tengah"
                        className={`f-input${errors.title ? ' err' : ''}`}/>
                      {errors.title && <p className="err-msg">{errors.title[0]}</p>}
                    </div>
                    <div>
                      <label className="f-label">Deskripsi <span style={{ color:'#ef4444' }}>*</span></label>
                      <textarea value={form.description} onChange={e => set('description', e.target.value)}
                        rows={4} placeholder="Kapan terjadi, seberapa parah, ada alat berat atau tidak..."
                        className={`f-input${errors.description ? ' err' : ''}`}
                        style={{ resize:'vertical', minHeight:100 }}/>
                      {errors.description && <p className="err-msg">{errors.description[0]}</p>}
                    </div>
                  </div>
                </div>

                {/* Kategori */}
                <div className="s-card fu d1">
                  <div className="s-icon-title">
                    <div className="s-icon" style={{ background:'rgba(245,158,11,.1)' }}>
                      <Tag size={17} color='#f59e0b'/>
                    </div>
                    <span className="s-title">Jenis & Keparahan</span>
                  </div>

                  <label className="f-label" style={{ marginBottom:10 }}>Jenis Kerusakan <span style={{ color:'#ef4444' }}>*</span></label>
                  <div className="type-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:20 }}>
                    {TYPES.map(t => (
                      <button key={t.value} type="button"
                        className={`type-btn${form.report_type === t.value ? ' active' : ''}`}
                        onClick={() => set('report_type', t.value)}
                      >
                        <div style={{ fontSize:22, marginBottom:5 }}>{t.emoji}</div>
                        <div style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, lineHeight:1.3,
                          color: form.report_type === t.value ? '#fff' : C.textMd,
                        }}>{t.label}</div>
                      </button>
                    ))}
                  </div>

                  <label className="f-label" style={{ marginBottom:10 }}>Tingkat Keparahan</label>
                  <div className="sev-row" style={{ display:'flex', gap:8 }}>
                    {SEVERITIES.map(s => (
                      <button key={s.value} type="button"
                        className={`sev-btn${form.severity === s.value ? ' active' : ''}`}
                        style={form.severity === s.value ? { borderColor:s.color, background:s.bg } : {}}
                        onClick={() => set('severity', s.value)}
                      >
                        <span style={{ display:'block', width:9, height:9, borderRadius:'50%', background:s.color, margin:'0 auto 7px' }}/>
                        <span style={{
                          fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
                          color: form.severity === s.value ? s.color : C.textMd,
                        }}>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lokasi */}
                <div className="s-card fu d2">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <div className="s-icon-title" style={{ marginBottom:0 }}>
                      <div className="s-icon" style={{ background:'rgba(14,165,233,.1)' }}>
                        <MapPin size={17} color='#0ea5e9'/>
                      </div>
                      <span className="s-title">Lokasi Kejadian</span>
                    </div>
                    <button type="button" className="geo-btn" onClick={detectLocation} disabled={geoLoading}>
                      <Locate size={14}/> {geoLoading ? 'Mendeteksi...' : 'Deteksi Otomatis'}
                    </button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div className="coord-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label className="f-label">Latitude <span style={{ color:'#ef4444' }}>*</span></label>
                        <input value={form.lat} onChange={e => set('lat', e.target.value)}
                          placeholder="-6.200000" className={`f-input${errors.lat ? ' err' : ''}`}/>
                        {errors.lat && <p className="err-msg">{errors.lat[0]}</p>}
                      </div>
                      <div>
                        <label className="f-label">Longitude <span style={{ color:'#ef4444' }}>*</span></label>
                        <input value={form.lng} onChange={e => set('lng', e.target.value)}
                          placeholder="106.800000" className={`f-input${errors.lng ? ' err' : ''}`}/>
                        {errors.lng && <p className="err-msg">{errors.lng[0]}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="f-label">Nama Lokasi</label>
                      <input value={form.location_text} onChange={e => set('location_text', e.target.value)}
                        placeholder="Contoh: Kalimantan Tengah, Kab. Kotawaringin" className="f-input"/>
                    </div>
                    <div style={{
                      display:'flex', alignItems:'flex-start', gap:9,
                      background:'rgba(14,165,233,.06)', border:'1px solid rgba(14,165,233,.12)',
                      borderRadius:12, padding:'11px 14px',
                    }}>
                      <Info size={14} color='#0ea5e9' style={{ flexShrink:0, marginTop:1 }}/>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.textMd, lineHeight:1.55 }}>
                        Klik <strong>Deteksi Otomatis</strong> untuk mengisi koordinat, atau salin dari Google Maps.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data tambahan + Foto */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

                  <div className="s-card fu d2">
                    <div className="s-icon-title">
                      <div className="s-icon" style={{ background:'rgba(239,68,68,.09)' }}>
                        <AlertTriangle size={17} color='#ef4444'/>
                      </div>
                      <span className="s-title" style={{ fontSize:15 }}>Data Tambahan</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <label className="f-label">Luas (hektar)</label>
                        <input type="number" value={form.area_affected} onChange={e => set('area_affected', e.target.value)}
                          placeholder="0" min="0" className="f-input"/>
                      </div>
                      <div>
                        <label className="f-label">Pohon hilang (est.)</label>
                        <input type="number" value={form.trees_lost} onChange={e => set('trees_lost', e.target.value)}
                          placeholder="0" min="0" className="f-input"/>
                      </div>
                    </div>
                  </div>

                  <div className="s-card fu d2" style={{ display:'flex', flexDirection:'column' }}>
                    <div className="s-icon-title">
                      <div className="s-icon" style={{ background:'rgba(139,92,246,.1)' }}>
                        <Camera size={17} color='#8b5cf6'/>
                      </div>
                      <span className="s-title" style={{ fontSize:15 }}>Foto Bukti</span>
                    </div>
                    <label style={{
                      flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      border:`2px dashed ${C.border}`, borderRadius:14, cursor:'pointer',
                      overflow:'hidden', background:C.offWhite, minHeight:140,
                      transition:'border-color .2s, background .2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.greenMd; e.currentTarget.style.background='rgba(45,106,79,.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.offWhite; }}
                    >
                      {preview ? (
                        <div style={{ position:'relative', width:'100%', height:'100%' }}>
                          <img src={preview} alt="preview" style={{ width:'100%', height:165, objectFit:'cover', display:'block' }}/>
                          <button type="button" onClick={e => { e.preventDefault(); setPreview(null); setPhoto(null); }} style={{
                            position:'absolute', top:8, right:8,
                            background:'rgba(255,255,255,.95)', border:`1px solid ${C.border}`,
                            borderRadius:'50%', width:30, height:30,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer', color:C.textMd,
                          }}><X size={14}/></button>
                        </div>
                      ) : (
                        <div style={{ padding:'20px', textAlign:'center' }}>
                          <Upload size={26} color={C.textLt} style={{ marginBottom:8 }}/>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textMd, fontWeight:500, marginBottom:3 }}>
                            Klik atau seret foto
                          </p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt }}>Maks. 5 MB</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>
                    </label>
                  </div>
                </div>

              </div>

              {/* ── RIGHT: Sticky preview + submit ── */}
              <div className="right-sticky" style={{ position:'sticky', top:96, display:'flex', flexDirection:'column', gap:16 }}>

                {/* Preview card */}
                <div className="fu d1" style={{
                  background:C.green, borderRadius:22, padding:'28px',
                  position:'relative', overflow:'hidden',
                }}>
                  <div style={{ position:'absolute', right:-30, top:-30, width:140, height:140, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>

                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'rgba(255,255,255,.4)', letterSpacing:'.8px', textTransform:'uppercase', marginBottom:18 }}>
                    Pratinjau Laporan
                  </p>

                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Judul preview */}
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:'rgba(255,255,255,.32)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:5 }}>Judul</p>
                      <p style={{
                        fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, lineHeight:1.3,
                        color: form.title ? '#fff' : 'rgba(255,255,255,.18)',
                      }}>{form.title || 'Belum diisi...'}</p>
                    </div>

                    <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>

                    {/* Badges */}
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                      <span style={{
                        background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                        borderRadius:99, padding:'4px 11px',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                        display:'flex', alignItems:'center', gap:5,
                      }}>
                        {TYPES.find(t => t.value === form.report_type)?.emoji}{' '}
                        {TYPES.find(t => t.value === form.report_type)?.label}
                      </span>
                      {activeSev && (
                        <span style={{
                          background:activeSev.bg, color:activeSev.color,
                          borderRadius:99, padding:'4px 11px',
                          fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600,
                          display:'flex', alignItems:'center', gap:4,
                        }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:activeSev.color }}/>
                          {activeSev.label}
                        </span>
                      )}
                    </div>

                    <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>

                    {/* Lokasi */}
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:'rgba(255,255,255,.32)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:5 }}>Lokasi</p>
                      <p style={{
                        fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                        color: (form.location_text || form.lat) ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.18)',
                      }}>
                        {form.location_text || (form.lat ? `${form.lat}, ${form.lng}` : 'Belum diisi...')}
                      </p>
                    </div>

                    {/* Data tambahan */}
                    {(form.area_affected || form.trees_lost) && (
                      <>
                        <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          {form.area_affected && (
                            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'12px' }}>
                              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fb923c', lineHeight:1 }}>{form.area_affected}</p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.32)', marginTop:3 }}>hektar</p>
                            </div>
                          )}
                          {form.trees_lost && (
                            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'12px' }}>
                              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#f87171', lineHeight:1 }}>{parseInt(form.trees_lost).toLocaleString('id')}</p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.32)', marginTop:3 }}>pohon hilang</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Trust badges */}
                    <div style={{ paddingTop:4, borderTop:'1px solid rgba(255,255,255,.08)' }}>
                      {[
                        '✅ Diverifikasi tim kami',
                        '📡 Diteruskan ke otoritas',
                        '🌿 Tercatat transparan',
                      ].map(t => (
                        <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,.38)', lineHeight:1.4 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button type="submit" className="btn-submit fu d2" disabled={loading}>
                  {loading
                    ? 'Mengirim...'
                    : <>Kirim Laporan <span className="ic"><ArrowRight size={16} color={C.lime}/></span></>
                  }
                </button>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt, textAlign:'center', lineHeight:1.6 }}>
                  Laporan akan diverifikasi tim kami sebelum dipublikasikan
                </p>

              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}