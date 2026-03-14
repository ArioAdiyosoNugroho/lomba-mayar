import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, TreePine,
  AlertTriangle, Users, Heart, FileText, ChevronRight,
} from 'lucide-react';

if (!document.getElementById('admin-fonts')) {
  const l = document.createElement('link');
  l.id = 'admin-fonts'; l.rel = 'stylesheet';
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

const STATUS_OPTIONS = ['pending', 'verified', 'resolved', 'rejected'];
const STATUS_CFG = {
  pending:  { bg:'#fffbeb', text:'#b45309', label:'Menunggu',      icon:Clock },
  verified: { bg:'#f0fdf4', text:'#15803d', label:'Terverifikasi', icon:CheckCircle },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', label:'Selesai',       icon:CheckCircle },
  rejected: { bg:'#fef2f2', text:'#b91c1c', label:'Ditolak',       icon:XCircle },
};
const SEVERITY_CFG = {
  low:      { dot:'#3b82f6', label:'Rendah' },
  medium:   { dot:'#f59e0b', label:'Sedang' },
  high:     { dot:'#f97316', label:'Tinggi' },
  critical: { dot:'#ef4444', label:'Kritis' },
};
const DON_STATUS = {
  paid:    { bg:'#f0fdf4', text:'#15803d', label:'Lunas' },
  pending: { bg:'#fffbeb', text:'#b45309', label:'Menunggu' },
  failed:  { bg:'#fef2f2', text:'#b91c1c', label:'Gagal' },
  expired: { bg:'#f1f5f9', text:'#64748b', label:'Expired' },
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
  .fu  { animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.05s; }
  .d2  { animation-delay:.12s; }
  .d3  { animation-delay:.19s; }

  .tab-btn {
    padding:9px 20px; border-radius:99px; border:none;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
    cursor:pointer; transition:all .2s; white-space:nowrap;
    display:flex; align-items:center; gap:6px;
  }
  .tab-btn.active   { background:${C.green}; color:#fff; }
  .tab-btn.inactive { background:transparent; color:${C.textLt}; }
  .tab-btn.inactive:hover { background:rgba(0,0,0,.05); color:${C.textDk}; }

  .filter-btn {
    padding:6px 16px; border-radius:99px; border:1.5px solid ${C.border};
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
    cursor:pointer; transition:all .2s; background:#fff; color:${C.textLt};
  }
  .filter-btn.active { background:${C.green}; color:#fff; border-color:${C.green}; }
  .filter-btn.inactive:hover { border-color:rgba(0,0,0,.18); color:${C.textDk}; }

  .stat-card {
    background:#fff; border-radius:20px; border:1px solid ${C.border};
    padding:22px; transition:box-shadow .2s;
  }
  .stat-card:hover { box-shadow:0 8px 24px rgba(0,0,0,.07); }

  .report-card {
    background:#fff; border-radius:20px; border:1px solid ${C.border};
    padding:20px 24px; transition:box-shadow .2s, border-color .18s;
  }
  .report-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.06); border-color:rgba(0,0,0,.12); }

  .don-row {
    display:flex; align-items:center; gap:14px;
    background:#fff; border:1px solid ${C.border};
    border-radius:18px; padding:16px 20px; transition:box-shadow .2s;
  }
  .don-row:hover { box-shadow:0 6px 20px rgba(0,0,0,.06); }

  .action-btn {
    padding:6px 14px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:600;
    border:1.5px solid ${C.border}; background:#fff; color:${C.textMd};
    cursor:pointer; transition:all .18s; white-space:nowrap;
  }
  .action-btn:hover { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.04); }

  @media (max-width:1024px) {
    .hero-content  { padding:20px 28px 52px !important; }
    .stats-grid    { grid-template-columns:1fr 1fr !important; }
    .overview-grid { grid-template-columns:1fr !important; }
  }
  @media (max-width:640px) {
    .hero-content { padding:16px 20px 44px !important; }
    .hero-h1      { font-size:40px !important; letter-spacing:-1.5px !important; }
    .hero-stats   { gap:20px !important; }
    .page-wrap    { padding:24px 16px 64px !important; }
    .stats-grid   { grid-template-columns:1fr 1fr !important; }
  }
`;

export default function AdminDashboard() {
  const [dash,      setDash]      = useState(null);
  const [reports,   setReports]   = useState([]);
  const [donations, setDonations] = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [repFilter, setRepFilter] = useState('pending');
  const [donFilter, setDonFilter] = useState('all');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => { setDash(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'reports') return;
    const params = repFilter !== 'all' ? `?status=${repFilter}` : '';
    api.get(`/admin/reports${params}`)
      .then(r => setReports(r.data?.data || r.data || []))
      .catch(() => {});
  }, [tab, repFilter]);

  useEffect(() => {
    if (tab !== 'donations') return;
    const params = donFilter !== 'all' ? `?status=${donFilter}` : '';
    api.get(`/admin/donations${params}`)
      .then(r => setDonations(r.data?.data || r.data || []))
      .catch(() => {});
  }, [tab, donFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      setReports(rs => rs.filter(r => r.id !== id));
      toast.success(`Status → ${STATUS_CFG[status]?.label ?? status}`);
    } catch { toast.error('Gagal update status.'); }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO dengan foto background ══════════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:300, background:C.green }}>

        {/* Foto background */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 40%',
            display:'block',
          }}
        />

        {/* Overlay gradient kiri→kanan */}
        <div style={{
          position:'absolute', inset:0,
          background:`linear-gradient(
            105deg,
            rgba(27,58,43,.97) 0%,
            rgba(27,58,43,.92) 35%,
            rgba(27,58,43,.65) 65%,
            rgba(27,58,43,.25) 100%
          )`,
        }}/>

        {/* Decorative circles — warna amber sesuai tema admin */}
        <div style={{ position:'absolute', right:-60, top:-60, width:320, height:320, borderRadius:'50%', background:'rgba(245,158,11,.07)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:140, bottom:40, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(245,158,11,.12)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:185, bottom:75, width:68, height:68, borderRadius:'50%', border:'1px solid rgba(245,158,11,.18)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'40%', top:30, width:5, height:5, borderRadius:'50%', background:'rgba(181,226,53,.3)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', left:'56%', bottom:44, width:4, height:4, borderRadius:'50%', background:'rgba(181,226,53,.2)', pointerEvents:'none' }}/>

        {/* Content */}
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
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
                background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.22)',
                borderRadius:99, padding:'5px 14px', marginBottom:18,
              }}>
                <ShieldCheck size={12} color='#fbbf24'/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#fbbf24', fontWeight:600 }}>
                  Admin Panel
                </span>
              </div>

              {/* Judul */}
              <h1 className="hero-h1" style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:64, lineHeight:.96, letterSpacing:'-2.5px', color:'#fff',
              }}>
                Dashboard<br/>
                <span style={{ color:C.lime }}>Administrator</span>
              </h1>
            </div>

            {/* Stats bar kanan */}
            {dash && (
              <div className="hero-stats fu d2" style={{ display:'flex', gap:32, flexWrap:'wrap', paddingBottom:4 }}>
                {[
                  { v: dash.users?.total ?? '—',            l:'Total Users',    c:'#60a5fa' },
                  { v: dash.reports?.pending ?? '—',        l:'Pending Review', c:'#fbbf24' },
                  { v: dash.donations?.total_trees ?? '—',  l:'Pohon Ditanam',  c:C.lime },
                ].map(({ v, l, c }) => (
                  <div key={l}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:c, lineHeight:1 }}>{v}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'rgba(255,255,255,.38)', marginTop:4 }}>{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'28px 60px 80px' }}>

          {/* Tab switcher */}
          <div className="fu d2" style={{
            display:'inline-flex', gap:4,
            background:'#fff', border:`1px solid ${C.border}`,
            borderRadius:99, padding:5, marginBottom:24,
          }}>
            {[
              { key:'overview',  label:'Overview',  Icon:FileText },
              { key:'reports',   label:'Laporan',   Icon:AlertTriangle },
              { key:'donations', label:'Donasi',    Icon:Heart },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`tab-btn ${tab === key ? 'active' : 'inactive'}`}
                onClick={() => setTab(key)}
              >
                <Icon size={13}/> {label}
                {key === 'reports' && dash?.reports?.pending > 0 && tab !== 'reports' && (
                  <span style={{
                    background:'#ef4444', color:'#fff',
                    borderRadius:99, padding:'1px 7px',
                    fontSize:10, fontWeight:800,
                  }}>{dash.reports.pending}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* Stat cards */}
              <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                {[
                  { Icon:Users,         val:dash?.users?.total,                                               label:'Total Users',    color:'#0ea5e9' },
                  { Icon:AlertTriangle, val:dash?.reports?.pending,                                           label:'Pending Review', color:'#f59e0b' },
                  { Icon:TreePine,      val:dash?.donations?.total_trees?.toLocaleString('id'),               label:'Pohon Ditanam',  color:C.greenMd },
                  { Icon:Heart,         val:`Rp ${((dash?.donations?.total_amount)||0).toLocaleString('id')}`,label:'Total Donasi',   color:'#e11d48' },
                ].map(({ Icon, val, label, color }) => (
                  <div key={label} className="stat-card">
                    <div style={{ width:38, height:38, borderRadius:11, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                      <Icon size={17} color={color}/>
                    </div>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:C.textDk, lineHeight:1, marginBottom:5 }}>{val ?? '—'}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Two-col: recent reports + recent donations */}
              <div className="overview-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                {/* Recent Reports */}
                <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk }}>Laporan Terbaru</p>
                    <button onClick={() => setTab('reports')} style={{ display:'flex', alignItems:'center', gap:3, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.greenMd, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Lihat Semua <ChevronRight size={13}/>
                    </button>
                  </div>
                  {dash?.recent_reports?.length > 0
                    ? dash.recent_reports.map((r, idx) => {
                        const sc = STATUS_CFG[r.status] ?? STATUS_CFG.pending;
                        return (
                          <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: idx < dash.recent_reports.length-1 ? `1px solid ${C.border}` : 'none' }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:SEVERITY_CFG[r.severity]?.dot ?? '#888' }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, color:C.textDk, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{r.title}</p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt }}>{r.user?.name}</p>
                            </div>
                            <span style={{ background:sc.bg, color:sc.text, borderRadius:99, padding:'3px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, flexShrink:0 }}>{sc.label}</span>
                          </div>
                        );
                      })
                    : <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt, textAlign:'center', padding:'20px 0' }}>Belum ada laporan.</p>
                  }
                </div>

                {/* Recent Donations */}
                <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk }}>Donasi Terbaru</p>
                    <button onClick={() => setTab('donations')} style={{ display:'flex', alignItems:'center', gap:3, fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.greenMd, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Lihat Semua <ChevronRight size={13}/>
                    </button>
                  </div>
                  {dash?.recent_donations?.length > 0
                    ? dash.recent_donations.map((d, idx) => {
                        const ds = DON_STATUS[d.status] ?? DON_STATUS.pending;
                        return (
                          <div key={d.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: idx < dash.recent_donations.length-1 ? `1px solid ${C.border}` : 'none' }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <TreePine size={15} color={C.greenMd}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, color:C.textDk, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {d.user?.name ?? d.donor_name ?? 'Anonim'}
                              </p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt }}>
                                {d.trees_count} pohon · {d.amount_formatted ?? `Rp ${d.amount?.toLocaleString('id')}`}
                              </p>
                            </div>
                            <span style={{ background:ds.bg, color:ds.text, borderRadius:99, padding:'3px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, flexShrink:0 }}>{ds.label}</span>
                          </div>
                        );
                      })
                    : <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt, textAlign:'center', padding:'20px 0' }}>Belum ada donasi.</p>
                  }
                </div>
              </div>

              {/* Status breakdown */}
              <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'22px 24px' }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:18 }}>Status Laporan</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {STATUS_OPTIONS.map(s => {
                    const sc  = STATUS_CFG[s];
                    const val = dash?.reports?.[s] ?? 0;
                    const max = Math.max(...STATUS_OPTIONS.map(x => dash?.reports?.[x] ?? 0), 1);
                    return (
                      <div key={s} style={{ background:sc.bg, borderRadius:16, padding:'18px 18px' }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:sc.text, fontWeight:700, letterSpacing:'.5px', textTransform:'uppercase', marginBottom:8 }}>{sc.label}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:sc.text, lineHeight:1, marginBottom:8 }}>{val}</p>
                        <div style={{ height:3, borderRadius:99, background:'rgba(0,0,0,.08)', overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:99, background:sc.text, width:`${(val/max)*100}%`, transition:'width .6s ease' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === 'reports' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 }}>
                {['all', ...STATUS_OPTIONS].map(s => (
                  <button key={s} className={`filter-btn ${repFilter === s ? 'active' : 'inactive'}`} onClick={() => setRepFilter(s)}>
                    {s === 'all' ? 'Semua' : (STATUS_CFG[s]?.label ?? s)}
                  </button>
                ))}
              </div>

              {reports.length > 0
                ? reports.map(r => {
                    const sc  = STATUS_CFG[r.status]    ?? STATUS_CFG.pending;
                    const sev = SEVERITY_CFG[r.severity] ?? SEVERITY_CFG.low;
                    return (
                      <div key={r.id} className="report-card">
                        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                          {r.photo_url && (
                            <img src={r.photo_url} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:14, flexShrink:0, border:`1px solid ${C.border}` }}/>
                          )}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                              <span style={{ background:sc.bg, color:sc.text, borderRadius:99, padding:'3px 11px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{sc.label}</span>
                              <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt }}>
                                <span style={{ width:6, height:6, borderRadius:'50%', background:sev.dot, display:'inline-block' }}/>{sev.label}
                              </span>
                            </div>
                            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:5, lineHeight:1.3 }}>{r.title}</h3>
                            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.textLt, marginBottom:r.description ? 8 : 0 }}>
                              {r.user?.name}{r.location_text && ` · ${r.location_text}`} · {new Date(r.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                            </p>
                            {r.description && (
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd, lineHeight:1.7, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                {r.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt, marginRight:4 }}>Ubah ke:</p>
                          {STATUS_OPTIONS.filter(s => s !== r.status).map(s => (
                            <button key={s} className="action-btn" onClick={() => updateStatus(r.id, s)}>
                              {STATUS_CFG[s]?.label ?? s}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                : (
                  <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'52px 32px', textAlign:'center' }}>
                    <CheckCircle size={40} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.textDk, marginBottom:6 }}>Tidak ada laporan</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>Tidak ada laporan dengan filter ini.</p>
                  </div>
                )
              }
            </div>
          )}

          {/* ── DONATIONS ── */}
          {tab === 'donations' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:4 }}>
                {['all', 'paid', 'pending', 'failed'].map(s => (
                  <button key={s} className={`filter-btn ${donFilter === s ? 'active' : 'inactive'}`} onClick={() => setDonFilter(s)}>
                    {s === 'all' ? 'Semua' : (DON_STATUS[s]?.label ?? s)}
                  </button>
                ))}
              </div>

              {donations.length > 0
                ? donations.map(d => {
                    const ds = DON_STATUS[d.status] ?? DON_STATUS.pending;
                    return (
                      <div key={d.id} className="don-row">
                        <div style={{ width:46, height:46, borderRadius:13, flexShrink:0, background:'#f0fdf4', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <TreePine size={20} color={C.greenMd}/>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:600, color:C.textDk, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {d.user?.name ?? d.donor_name ?? 'Anonim'}
                          </p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                            {d.trees_count} pohon · {d.user?.email ?? d.donor_email ?? '-'} · {new Date(d.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                          </p>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:4 }}>
                            {d.amount_formatted ?? `Rp ${d.amount?.toLocaleString('id')}`}
                          </p>
                          <span style={{ background:ds.bg, color:ds.text, borderRadius:99, padding:'3px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                            {ds.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                : (
                  <div style={{ background:'#fff', borderRadius:20, border:`1px solid ${C.border}`, padding:'52px 32px', textAlign:'center' }}>
                    <Heart size={40} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.textDk, marginBottom:6 }}>Tidak ada donasi</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>Belum ada donasi dengan filter ini.</p>
                  </div>
                )
              }
            </div>
          )}

        </div>
      </div>
    </>
  );
}