import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Upload, Locate, AlertTriangle, ArrowRight,
  X, Info, MapPin, FileText, Tag, Camera,
  ChevronDown,
} from 'lucide-react';

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

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1 { animation-delay:.06s; }
  .d2 { animation-delay:.14s; }

  /* ── Form elements ── */
  .f-label {
    display:block; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
    color:${C.textLt}; letter-spacing:.6px; text-transform:uppercase; margin-bottom:7px;
  }
  .f-input {
    width:100%; background:${C.offWhite}; border:2px solid ${C.border};
    border-radius:13px; padding:13px 16px; font-family:'DM Sans',sans-serif;
    font-size:15px; color:${C.textDk}; outline:none;
    transition:border-color .18s, background .18s, box-shadow .18s;
    -webkit-appearance:none;
  }
  .f-input:focus { border-color:${C.greenMd}; background:#fff; box-shadow:0 0 0 4px rgba(45,106,79,.08); }
  .f-input::placeholder { color:${C.textLt}; }
  .f-input.err { border-color:#ef4444 !important; }

  /* ── Type button ── */
  .type-btn {
    padding:12px 6px; border-radius:14px; border:2px solid ${C.border};
    background:#fff; cursor:pointer; text-align:center; transition:all .15s;
    -webkit-tap-highlight-color:transparent;
  }
  .type-btn:hover  { border-color:${C.greenMd}; }
  .type-btn:active { transform:scale(.95); }
  .type-btn.active { border-color:${C.green}; background:${C.green}; }

  /* ── Severity button ── */
  .sev-btn {
    flex:1; padding:12px 6px; border-radius:12px;
    border:2px solid ${C.border}; background:#fff;
    cursor:pointer; text-align:center; transition:all .15s;
    min-width:60px;
    -webkit-tap-highlight-color:transparent;
  }
  .sev-btn:active { transform:scale(.96); }

  /* ── Geo button ── */
  .geo-btn {
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(45,106,79,.09); color:${C.greenMd};
    border:none; border-radius:99px; padding:9px 16px; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
    transition:background .18s; white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .geo-btn:hover    { background:rgba(45,106,79,.15); }
  .geo-btn:disabled { opacity:.4; cursor:not-allowed; }

  /* ── Section card ── */
  .s-card { background:#fff; border-radius:20px; border:1px solid ${C.border}; padding:22px 24px; }
  .s-head { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
  .s-icon { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .s-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:${C.textDk}; }

  /* ── Submit button ── */
  .btn-submit {
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:16px 16px 16px 28px; border-radius:99px; width:100%;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:15.5px;
    border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-submit:hover:not(:disabled) {
    background:${C.limeHov}; transform:translateY(-2px);
    box-shadow:0 12px 32px rgba(181,226,53,.35);
  }
  .btn-submit:active:not(:disabled) { transform:scale(.98); }
  .btn-submit:disabled { opacity:.4; cursor:not-allowed; }
  .btn-submit .ic {
    width:42px; height:42px; border-radius:50%; background:${C.textDk}; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; transition:transform .2s;
  }
  .btn-submit:hover:not(:disabled) .ic { transform:translateX(3px); }

  /* ── Error message ── */
  .err-msg { font-family:'DM Sans',sans-serif; font-size:12px; color:#ef4444; margin-top:5px; }

  /* ── Mobile sticky footer ── */
  .mob-footer {
    position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:#fff; padding:12px 16px 20px;
    border-top:1px solid ${C.border};
    box-shadow:0 -8px 32px rgba(0,0,0,.1);
    display:none;
  }

  /* ── Responsive ── */
  @media (max-width:1024px) {
    .report-grid { grid-template-columns:1fr !important; }
    .right-col   { position:static !important; }
  }
  @media (max-width:640px) {
    .hero-wrap    { padding:16px 20px 36px !important; }
    .hero-title   { font-size:40px !important; letter-spacing:-1.5px !important; }
    .hero-stats   { gap:18px !important; }
    .stat-val     { font-size:20px !important; }
    .page-wrap    { padding:18px 14px 100px !important; }   /* bottom padding for sticky footer */
    .s-card       { border-radius:18px !important; padding:18px 16px !important; }
    .type-grid    { grid-template-columns:repeat(3,1fr) !important; }
    .coord-row    { grid-template-columns:1fr !important; }
    .extra-row    { grid-template-columns:1fr 1fr !important; }
    .photo-upload { min-height:120px !important; }
    .mob-footer   { display:block !important; }
    .desk-submit  { display:none !important; }
    .right-col    { display:none !important; }
  }
`;

/* ─────────────────────────────────────────────────────────── */
export default function ReportPage() {
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [photo,      setPhoto]      = useState(null);
  const [errors,     setErrors]     = useState({});
  const [showExtra,  setShowExtra]  = useState(false); // mobile collapsible "Data Tambahan"

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
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error('Ada kesalahan pada form.');
        // Scroll to first error on mobile
        setTimeout(() => {
          const el = document.querySelector('.err');
          if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
        }, 100);
      } else toast.error('Gagal mengirim laporan.');
    } finally { setLoading(false); }
  };

  const activeSev = SEVERITIES.find(s => s.value === form.severity);
  const activeType = TYPES.find(t => t.value === form.report_type);

  /* ── Step progress indicator (mobile) ── */
  const progress = [
    !!form.title && !!form.description,
    !!form.report_type,
    !!form.lat && !!form.lng,
  ];
  const progressCount = progress.filter(Boolean).length;

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }}>
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 35%', display:'block' }}
        />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(105deg,rgba(27,58,43,.97) 0%,rgba(27,58,43,.90) 38%,rgba(27,58,43,.55) 70%,rgba(27,58,43,.2) 100%)' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-wrap" style={{ padding:'16px 60px 48px' }}>

            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7,
              background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.22)',
              borderRadius:99, padding:'5px 14px', marginBottom:16 }}>
              <AlertTriangle size={12} color='#f87171'/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:'#f87171', fontWeight:600 }}>Laporan Kerusakan Hutan</span>
            </div>

            <h1 className="fu d1 hero-title" style={{ fontFamily:"'Syne',sans-serif",
              fontWeight:800, fontSize:58, lineHeight:.96,
              letterSpacing:'-2.5px', color:'#fff', marginBottom:22 }}>
              Buat Laporan,<br/><span style={{ color:C.lime }}>Sekarang</span>
            </h1>

            <div className="hero-stats" style={{ display:'flex', gap:26, flexWrap:'wrap' }}>
              {[
                { v:'12.400+', l:'Laporan Terkirim' },
                { v:'87%',     l:'Ditindaklanjuti'  },
                { v:'3.200+',  l:'Relawan Aktif'    },
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

      {/* ── FORM ── */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'28px 60px 80px' }}>
          <form onSubmit={submit}>

            {/* Mobile progress bar */}
            <div className="mob-progress" style={{ display:'none', marginBottom:18 }}>
              <style>{`@media(max-width:640px){.mob-progress{display:block!important}}`}</style>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                  Progres pengisian
                </span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:C.greenMd }}>
                  {progressCount}/3 langkah
                </span>
              </div>
              <div style={{ height:5, borderRadius:99, background:C.border, overflow:'hidden' }}>
                <div style={{ height:5, borderRadius:99, background:C.lime,
                  width:`${(progressCount/3)*100}%`, transition:'width .4s ease' }}/>
              </div>
            </div>

            <div className="report-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:22, alignItems:'start' }}>

              {/* ═══ LEFT: Form fields ═══ */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* ── 1. Informasi Utama ── */}
                <div className="s-card fu d1">
                  <div className="s-head">
                    <div className="s-icon" style={{ background:'rgba(27,58,43,.08)' }}>
                      <FileText size={16} color={C.greenMd}/>
                    </div>
                    <span className="s-title">Informasi Utama</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <label className="f-label">
                        Judul Laporan <span style={{ color:'#ef4444' }}>*</span>
                      </label>
                      <input
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Contoh: Pembukaan lahan sawit ilegal di Kalimantan Tengah"
                        className={`f-input${errors.title ? ' err' : ''}`}
                      />
                      {errors.title && <p className="err-msg">{errors.title[0]}</p>}
                    </div>
                    <div>
                      <label className="f-label">
                        Deskripsi <span style={{ color:'#ef4444' }}>*</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={4}
                        placeholder="Kapan terjadi, seberapa parah, ada alat berat atau tidak..."
                        className={`f-input${errors.description ? ' err' : ''}`}
                        style={{ resize:'vertical', minHeight:100 }}
                      />
                      {errors.description && <p className="err-msg">{errors.description[0]}</p>}
                    </div>
                  </div>
                </div>

                {/* ── 2. Jenis & Keparahan ── */}
                <div className="s-card fu d1">
                  <div className="s-head">
                    <div className="s-icon" style={{ background:'rgba(245,158,11,.1)' }}>
                      <Tag size={16} color='#f59e0b'/>
                    </div>
                    <span className="s-title">Jenis & Keparahan</span>
                  </div>

                  {/* Type grid */}
                  <label className="f-label" style={{ marginBottom:10 }}>
                    Jenis Kerusakan <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <div className="type-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8, marginBottom:20 }}>
                    {TYPES.map(t => (
                      <button key={t.value} type="button"
                        className={`type-btn${form.report_type === t.value ? ' active' : ''}`}
                        onClick={() => set('report_type', t.value)}>
                        <div style={{ fontSize:22, marginBottom:5 }}>{t.emoji}</div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                          fontWeight:600, lineHeight:1.25,
                          color: form.report_type === t.value ? '#fff' : C.textMd }}>
                          {t.label}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Severity */}
                  <label className="f-label" style={{ marginBottom:10 }}>Tingkat Keparahan</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'nowrap' }}>
                    {SEVERITIES.map(s => (
                      <button key={s.value} type="button"
                        className="sev-btn"
                        style={form.severity === s.value
                          ? { borderColor:s.color, background:s.bg, transform:'translateY(-1px)',
                              boxShadow:`0 4px 12px ${s.color}30` }
                          : {}}
                        onClick={() => set('severity', s.value)}>
                        <span style={{ display:'block', width:9, height:9, borderRadius:'50%',
                          background:s.color, margin:'0 auto 7px' }}/>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700,
                          color: form.severity === s.value ? s.color : C.textMd }}>
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── 3. Lokasi ── */}
                <div className="s-card fu d1">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                    <div className="s-head" style={{ marginBottom:0 }}>
                      <div className="s-icon" style={{ background:'rgba(14,165,233,.1)' }}>
                        <MapPin size={16} color='#0ea5e9'/>
                      </div>
                      <span className="s-title">Lokasi Kejadian</span>
                    </div>
                    <button type="button" className="geo-btn" onClick={detectLocation} disabled={geoLoading}>
                      <Locate size={14}/>
                      {geoLoading ? 'Mendeteksi…' : 'Deteksi Otomatis'}
                    </button>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div className="coord-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label className="f-label">Latitude <span style={{ color:'#ef4444' }}>*</span></label>
                        <input value={form.lat}
                          onChange={e => set('lat', e.target.value)}
                          placeholder="-6.200000"
                          inputMode="decimal"
                          className={`f-input${errors.lat ? ' err' : ''}`}/>
                        {errors.lat && <p className="err-msg">{errors.lat[0]}</p>}
                      </div>
                      <div>
                        <label className="f-label">Longitude <span style={{ color:'#ef4444' }}>*</span></label>
                        <input value={form.lng}
                          onChange={e => set('lng', e.target.value)}
                          placeholder="106.800000"
                          inputMode="decimal"
                          className={`f-input${errors.lng ? ' err' : ''}`}/>
                        {errors.lng && <p className="err-msg">{errors.lng[0]}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="f-label">Nama Lokasi</label>
                      <input value={form.location_text}
                        onChange={e => set('location_text', e.target.value)}
                        placeholder="Contoh: Kalimantan Tengah, Kab. Kotawaringin"
                        className="f-input"/>
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:9,
                      background:'rgba(14,165,233,.06)', border:'1px solid rgba(14,165,233,.12)',
                      borderRadius:12, padding:'11px 14px' }}>
                      <Info size={14} color='#0ea5e9' style={{ flexShrink:0, marginTop:1 }}/>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                        color:C.textMd, lineHeight:1.55 }}>
                        Klik <strong>Deteksi Otomatis</strong> atau salin koordinat dari Google Maps.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── 4. Foto Bukti ── */}
                <div className="s-card fu d2">
                  <div className="s-head">
                    <div className="s-icon" style={{ background:'rgba(139,92,246,.1)' }}>
                      <Camera size={16} color='#8b5cf6'/>
                    </div>
                    <span className="s-title">Foto Bukti</span>
                  </div>

                  <label style={{
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    border:`2px dashed ${C.border}`, borderRadius:16, cursor:'pointer',
                    overflow:'hidden', background:C.offWhite,
                    transition:'border-color .2s, background .2s',
                    minHeight:140,
                  }}
                  className="photo-upload"
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.greenMd; e.currentTarget.style.background='rgba(45,106,79,.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background=C.offWhite; }}
                  >
                    {preview ? (
                      <div style={{ position:'relative', width:'100%' }}>
                        <img src={preview} alt="preview"
                          style={{ width:'100%', maxHeight:260, objectFit:'cover', display:'block', borderRadius:14 }}/>
                        <button type="button"
                          onClick={e => { e.preventDefault(); setPreview(null); setPhoto(null); }}
                          style={{
                            position:'absolute', top:10, right:10,
                            background:'rgba(255,255,255,.95)', border:`1px solid ${C.border}`,
                            borderRadius:'50%', width:34, height:34,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer', color:C.textMd, boxShadow:'0 2px 8px rgba(0,0,0,.12)',
                          }}>
                          <X size={15}/>
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding:'28px 20px', textAlign:'center' }}>
                        <div style={{
                          width:52, height:52, borderRadius:14,
                          background:'rgba(139,92,246,.1)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          margin:'0 auto 12px',
                        }}>
                          <Upload size={22} color='#8b5cf6'/>
                        </div>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                          color:C.textMd, fontWeight:600, marginBottom:4 }}>
                          Upload Foto Bukti
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                          Klik atau seret · Maks. 5 MB
                        </p>
                      </div>
                    )}
                    <input type="file" accept="image/*" capture="environment"
                      style={{ display:'none' }} onChange={handlePhoto}/>
                  </label>

                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                    marginTop:10, textAlign:'center' }}>
                    📸 Di mobile, kamu juga bisa langsung ambil foto dari kamera
                  </p>
                </div>

                {/* ── 5. Data Tambahan (collapsible on mobile) ── */}
                <div className="s-card fu d2">
                  <button type="button"
                    style={{ width:'100%', display:'flex', alignItems:'center',
                      justifyContent:'space-between', background:'none', border:'none',
                      cursor:'pointer', padding:0, '-webkit-tap-highlight-color':'transparent' }}
                    onClick={() => setShowExtra(s => !s)}>
                    <div className="s-head" style={{ marginBottom:0 }}>
                      <div className="s-icon" style={{ background:'rgba(239,68,68,.09)' }}>
                        <AlertTriangle size={16} color='#ef4444'/>
                      </div>
                      <div style={{ textAlign:'left' }}>
                        <span className="s-title">Data Tambahan</span>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                          color:C.textLt, marginTop:2 }}>Opsional — luas & estimasi pohon</p>
                      </div>
                    </div>
                    <ChevronDown size={18} color={C.textLt}
                      style={{ transition:'transform .25s', flexShrink:0,
                        transform: showExtra ? 'rotate(180deg)' : 'rotate(0deg)' }}/>
                  </button>

                  {showExtra && (
                    <div style={{ marginTop:18, paddingTop:16,
                      borderTop:`1px solid ${C.border}` }}>
                      <div className="extra-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        <div>
                          <label className="f-label">Luas (hektar)</label>
                          <input type="number" value={form.area_affected}
                            onChange={e => set('area_affected', e.target.value)}
                            placeholder="0" min="0" inputMode="decimal" className="f-input"/>
                        </div>
                        <div>
                          <label className="f-label">Pohon hilang (est.)</label>
                          <input type="number" value={form.trees_lost}
                            onChange={e => set('trees_lost', e.target.value)}
                            placeholder="0" min="0" inputMode="numeric" className="f-input"/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop submit (below form, hidden on mobile) */}
                <div className="desk-submit" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <button type="submit" className="btn-submit fu d2" disabled={loading}>
                    {loading
                      ? 'Mengirim…'
                      : <>Kirim Laporan <span className="ic"><ArrowRight size={16} color={C.lime}/></span></>
                    }
                  </button>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                    textAlign:'center', lineHeight:1.6 }}>
                    Laporan diverifikasi sebelum dipublikasikan
                  </p>
                </div>

              </div>

              {/* ═══ RIGHT: Sticky preview (desktop only) ═══ */}
              <div className="right-col fu d2" style={{ position:'sticky', top:96,
                display:'flex', flexDirection:'column', gap:16 }}>

                {/* Preview card */}
                <div style={{ background:C.green, borderRadius:22, padding:'26px',
                  position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', right:-28, top:-28,
                    width:130, height:130, borderRadius:'50%',
                    background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>

                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.35)',
                    letterSpacing:'.8px', textTransform:'uppercase', marginBottom:16 }}>
                    Pratinjau Laporan
                  </p>

                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
                        color:'rgba(255,255,255,.28)', textTransform:'uppercase',
                        letterSpacing:'.6px', marginBottom:5 }}>Judul</p>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15,
                        fontWeight:700, lineHeight:1.3,
                        color: form.title ? '#fff' : 'rgba(255,255,255,.16)' }}>
                        {form.title || 'Belum diisi…'}
                      </p>
                    </div>
                    <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>
                    <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                      <span style={{ background:'rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)',
                        borderRadius:99, padding:'4px 11px',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11.5 }}>
                        {activeType?.emoji} {activeType?.label}
                      </span>
                      {activeSev && (
                        <span style={{ background:activeSev.bg, color:activeSev.color,
                          borderRadius:99, padding:'4px 11px',
                          fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600,
                          display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ width:6, height:6, borderRadius:'50%', background:activeSev.color }}/>
                          {activeSev.label}
                        </span>
                      )}
                    </div>
                    <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
                        color:'rgba(255,255,255,.28)', textTransform:'uppercase',
                        letterSpacing:'.6px', marginBottom:5 }}>Lokasi</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                        color: (form.location_text || form.lat) ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.16)' }}>
                        {form.location_text || (form.lat ? `${form.lat}, ${form.lng}` : 'Belum diisi…')}
                      </p>
                    </div>
                    {(form.area_affected || form.trees_lost) && (
                      <>
                        <div style={{ height:1, background:'rgba(255,255,255,.08)' }}/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                          {form.area_affected && (
                            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'12px' }}>
                              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fb923c', lineHeight:1 }}>
                                {form.area_affected}
                              </p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.28)', marginTop:3 }}>hektar</p>
                            </div>
                          )}
                          {form.trees_lost && (
                            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:12, padding:'12px' }}>
                              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#f87171', lineHeight:1 }}>
                                {parseInt(form.trees_lost).toLocaleString('id')}
                              </p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.28)', marginTop:3 }}>pohon hilang</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:14 }}>
                      {['✅ Diverifikasi tim kami','📡 Diteruskan ke otoritas','🌿 Tercatat transparan'].map(t => (
                        <p key={t} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                          color:'rgba(255,255,255,.32)', marginBottom:6 }}>{t}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? 'Mengirim…'
                    : <>Kirim Laporan <span className="ic"><ArrowRight size={16} color={C.lime}/></span></>
                  }
                </button>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                  textAlign:'center', lineHeight:1.6 }}>
                  Laporan diverifikasi sebelum dipublikasikan
                </p>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE STICKY FOOTER — submit bar
      ═══════════════════════════════════════════════════════ */}
      <div className="mob-footer">
        {/* Mini status row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          marginBottom:10, padding:'0 2px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Type + severity chips */}
            <span style={{ display:'inline-flex', alignItems:'center', gap:4,
              background:activeSev?.bg, color:activeSev?.color,
              borderRadius:99, padding:'4px 10px',
              fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:activeSev?.color }}/>
              {activeSev?.label}
            </span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
              {activeType?.emoji} {activeType?.label}
            </span>
          </div>
          {/* Progress dots */}
          <div style={{ display:'flex', gap:4 }}>
            {progress.map((done, i) => (
              <span key={i} style={{ width:8, height:8, borderRadius:'50%',
                background: done ? C.lime : C.border, transition:'background .3s' }}/>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn-submit"
          style={{ fontSize:15 }}
          onClick={e => {
            const form = document.querySelector('form');
            form?.dispatchEvent(new Event('submit', { cancelable:true, bubbles:true }));
          }}
          disabled={loading}
        >
          {loading
            ? 'Mengirim…'
            : <>Kirim Laporan <span className="ic" style={{ width:40, height:40 }}>
                <ArrowRight size={16} color={C.lime}/>
              </span></>
          }
        </button>
      </div>
    </>
  );
}