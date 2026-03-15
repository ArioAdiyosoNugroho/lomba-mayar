import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, TreePine,
  AlertTriangle, Users, Heart, FileText, ChevronRight,
  ArrowRight,
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
  offWhite: '#f5f5f0',
  textDk  : '#0f1a10',
  textMd  : '#4a5544',
  textLt  : '#8a9984',
  border  : 'rgba(0,0,0,.08)',
};

const STATUS_OPTIONS = ['pending', 'verified', 'resolved', 'rejected'];
const STATUS_CFG = {
  pending:  { bg:'#fffbeb', text:'#b45309', dot:'#f59e0b', label:'Menunggu',      Icon:Clock       },
  verified: { bg:'#f0fdf4', text:'#15803d', dot:'#16a34a', label:'Terverifikasi', Icon:CheckCircle },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', dot:'#3b82f6', label:'Selesai',       Icon:CheckCircle },
  rejected: { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', label:'Ditolak',       Icon:XCircle     },
};
const SEV_CFG = {
  low:      { dot:'#3b82f6', label:'Rendah' },
  medium:   { dot:'#f59e0b', label:'Sedang' },
  high:     { dot:'#f97316', label:'Tinggi' },
  critical: { dot:'#ef4444', label:'Kritis' },
};
const DON_STATUS = {
  paid:    { bg:'#f0fdf4', text:'#15803d', dot:'#16a34a', label:'Lunas'    },
  pending: { bg:'#fffbeb', text:'#b45309', dot:'#f59e0b', label:'Menunggu' },
  failed:  { bg:'#fef2f2', text:'#b91c1c', dot:'#ef4444', label:'Gagal'    },
  expired: { bg:'#f1f5f9', text:'#64748b', dot:'#94a3b8', label:'Expired'  },
};

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .fu  { animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.05s; }
  .d2  { animation-delay:.12s; }
  .d3  { animation-delay:.19s; }

  /* ── Tab pills ── */
  .tab-btn {
    display:flex; align-items:center; gap:6px;
    padding:9px 18px; border-radius:99px; border:none;
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500;
    cursor:pointer; transition:all .18s; white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .tab-btn.active   { background:${C.green}; color:#fff; }
  .tab-btn.inactive { background:transparent; color:${C.textLt}; }
  .tab-btn.inactive:hover { background:rgba(0,0,0,.05); color:${C.textDk}; }

  /* ── Filter pills ── */
  .filter-btn {
    padding:7px 16px; border-radius:99px;
    border:1.5px solid ${C.border}; background:#fff;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
    cursor:pointer; transition:all .18s; color:${C.textLt};
    white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .filter-btn.active  { background:${C.green}; color:#fff; border-color:${C.green}; }
  .filter-btn:hover:not(.active) { border-color:rgba(0,0,0,.18); color:${C.textDk}; }

  /* ── Stat card ── */
  .stat-card {
    background:#fff; border-radius:20px; border:1px solid ${C.border};
    padding:20px; transition:transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.07); }

  /* ── Report card ── */
  .rep-card {
    background:#fff; border-radius:20px; border:1px solid ${C.border};
    padding:18px 20px; transition:box-shadow .18s, border-color .18s;
  }
  .rep-card:hover { box-shadow:0 6px 20px rgba(0,0,0,.06); border-color:rgba(0,0,0,.12); }

  /* ── Donation row ── */
  .don-row {
    display:flex; align-items:center; gap:14px;
    background:#fff; border:1px solid ${C.border};
    border-radius:18px; padding:14px 18px;
    transition:box-shadow .18s;
  }
  .don-row:hover { box-shadow:0 6px 20px rgba(0,0,0,.06); }

  /* ── Action btn ── */
  .action-btn {
    padding:6px 14px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:600;
    border:1.5px solid ${C.border}; background:#fff; color:${C.textMd};
    cursor:pointer; transition:all .15s; white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .action-btn:hover { border-color:${C.greenMd}; color:${C.greenMd}; background:rgba(45,106,79,.04); }
  .action-btn:active { transform:scale(.96); }

  /* ── Status badge ── */
  .status-badge {
    display:inline-flex; align-items:center; gap:4px;
    border-radius:99px; padding:3px 10px;
    font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
    flex-shrink:0;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12); border-radius:99px; }
  .hide-scroll::-webkit-scrollbar { display:none; }
  .hide-scroll { scrollbar-width:none; }

  /* ══ RESPONSIVE ══ */
  @media (max-width:1024px) {
    .stats-grid    { grid-template-columns:1fr 1fr !important; }
    .overview-grid { grid-template-columns:1fr !important; }
    .status-grid   { grid-template-columns:1fr 1fr !important; }
  }
  @media (max-width:640px) {
    /* Hero */
    .hero-pad      { padding:14px 16px 32px !important; }
    .hero-h1       { font-size:36px !important; letter-spacing:-1.2px !important; }
    .hero-stats    { gap:16px !important; }
    .stat-val      { font-size:20px !important; }

    /* Layout */
    .page-wrap     { padding:18px 14px 60px !important; }
    .stats-grid    { grid-template-columns:1fr 1fr !important; gap:10px !important; }
    .status-grid   { grid-template-columns:1fr 1fr !important; gap:10px !important; }
    .stat-card     { padding:16px !important; border-radius:16px !important; }

    /* Tab bar → scrollable */
    .tab-row       { width:100% !important; overflow-x:auto !important; }
    .tab-btn       { font-size:13px !important; padding:8px 14px !important; }

    /* Filter row → scrollable */
    .filter-row    { overflow-x:auto !important; flex-wrap:nowrap !important; }

    /* Report card */
    .rep-card      { padding:14px 16px !important; border-radius:16px !important; }
    .rep-img       { display:none !important; }  /* hide thumbnail on mobile */
    .rep-actions   { gap:6px !important; }

    /* Donation row */
    .don-row       { padding:12px 14px !important; border-radius:14px !important; }

    /* Overview grid — 1 kolom di mobile agar tidak overflow */
    .overview-grid { grid-template-columns:1fr !important; gap:10px !important; }
    .ov-card       { border-radius:16px !important; padding:18px 16px !important; }
  }
`;

/* ── Status Badge component ── */
function StatusBadge({ status, cfg }) {
  return (
    <span className="status-badge" style={{ background:cfg.bg, color:cfg.text }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot }}/>
      {cfg.label}
    </span>
  );
}

/* ── Stat Card component ── */
function StatCard({ Icon, val, label, color, delay }) {
  return (
    <div className={`stat-card fu ${delay}`}>
      <div style={{
        width:38, height:38, borderRadius:11,
        background:color+'18', display:'flex', alignItems:'center',
        justifyContent:'center', marginBottom:14,
      }}>
        <Icon size={17} color={color}/>
      </div>
      <p style={{
        fontFamily:"'Syne',sans-serif",
        fontSize: typeof val === 'string' && val.length > 10 ? 'clamp(13px,3vw,18px)' : 'clamp(16px,4vw,26px)',
        fontWeight:800, color:C.textDk, lineHeight:1.1,
        marginBottom:5, wordBreak:'break-word',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>{val ?? '—'}</p>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>{label}</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
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
    const q = repFilter !== 'all' ? `?status=${repFilter}` : '';
    api.get(`/admin/reports${q}`)
      .then(r => setReports(r.data?.data || r.data || []))
      .catch(() => {});
  }, [tab, repFilter]);

  useEffect(() => {
    if (tab !== 'donations') return;
    const q = donFilter !== 'all' ? `?status=${donFilter}` : '';
    api.get(`/admin/donations${q}`)
      .then(r => setDonations(r.data?.data || r.data || []))
      .catch(() => {});
  }, [tab, donFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reports/${id}`, { status });
      setReports(rs => rs.filter(r => r.id !== id));
      toast.success(`Status → ${STATUS_CFG[status]?.label}`);
    } catch { toast.error('Gagal update status.'); }
  };

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* ════ HERO ════ */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }}>
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 40%', display:'block' }}
        />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(105deg,rgba(27,58,43,.97) 0%,rgba(27,58,43,.92) 35%,rgba(27,58,43,.6) 70%,rgba(27,58,43,.2) 100%)' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-pad" style={{ padding:'16px 60px 48px' }}>

            {/* Admin badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:7,
              background:'rgba(245,158,11,.15)', border:'1px solid rgba(245,158,11,.22)',
              borderRadius:99, padding:'5px 14px', marginBottom:16 }}>
              <ShieldCheck size={12} color='#fbbf24'/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:'#fbbf24', fontWeight:600 }}>Admin Panel</span>
            </div>

            <h1 className="fu d1 hero-h1" style={{ fontFamily:"'Syne',sans-serif",
              fontWeight:800, fontSize:58, lineHeight:.96,
              letterSpacing:'-2.5px', color:'#fff', marginBottom:22 }}>
              Dashboard<br/><span style={{ color:C.lime }}>Administrator</span>
            </h1>

            {/* Hero stats */}
            {dash && (
              <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                {[
                  { v:dash.users?.total   ?? '—', l:'Total Users',    c:'#60a5fa' },
                  { v:dash.reports?.pending ?? '—',l:'Pending Review', c:'#fbbf24' },
                  { v:dash.donations?.total_trees ?? '—', l:'Pohon Ditanam', c:C.lime },
                ].map(({ v, l, c }) => (
                  <div key={l}>
                    <p className="stat-val" style={{ fontFamily:"'Syne',sans-serif",
                      fontSize:24, fontWeight:800, color:c, lineHeight:1 }}>{v}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                      color:'rgba(255,255,255,.38)', marginTop:4 }}>{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'24px 60px 80px' }}>

          {/* ── Tab bar ── */}
          <div className="fu d2 tab-row hide-scroll" style={{
            display:'inline-flex', gap:4,
            background:'#fff', border:`1px solid ${C.border}`,
            borderRadius:99, padding:5, marginBottom:22,
          }}>
            {[
              { key:'overview',  label:'Overview',  Icon:FileText,        badge:null },
              { key:'reports',   label:'Laporan',   Icon:AlertTriangle,   badge:dash?.reports?.pending },
              { key:'donations', label:'Donasi',    Icon:Heart,           badge:null },
            ].map(({ key, label, Icon, badge }) => (
              <button key={key}
                className={`tab-btn ${tab === key ? 'active' : 'inactive'}`}
                onClick={() => setTab(key)}>
                <Icon size={13}/> {label}
                {badge > 0 && tab !== key && (
                  <span style={{ background:'#ef4444', color:'#fff',
                    borderRadius:99, padding:'1px 6px',
                    fontSize:10, fontWeight:800, lineHeight:1.4 }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
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

          {/* ════ OVERVIEW ════ */}
          {!loading && tab === 'overview' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Stat cards 4-col */}
              <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                <StatCard Icon={Users}         val={dash?.users?.total}
                  label="Total Users"    color="#0ea5e9" delay="d1"/>
                <StatCard Icon={AlertTriangle} val={dash?.reports?.pending}
                  label="Pending Review" color="#f59e0b" delay="d1"/>
                <StatCard Icon={TreePine}      val={dash?.donations?.total_trees?.toLocaleString('id')}
                  label="Pohon Ditanam"  color={C.greenMd} delay="d2"/>
                <StatCard Icon={Heart}
                  val={`Rp ${(parseInt(dash?.donations?.total_amount)||0).toLocaleString('id')}`}
                  label="Total Donasi"   color="#e11d48" delay="d2"/>
              </div>

              {/* Recent: 2-col */}
              <div className="overview-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

                {/* Recent Reports */}
                <div className="ov-card" style={{ background:'#fff', borderRadius:20,
                  border:`1px solid ${C.border}`, padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk }}>
                      Laporan Terbaru
                    </p>
                    <button onClick={() => setTab('reports')}
                      style={{ display:'flex', alignItems:'center', gap:3,
                        fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.greenMd,
                        fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Lihat <ChevronRight size={13}/>
                    </button>
                  </div>
                  {dash?.recent_reports?.length > 0
                    ? dash.recent_reports.map((r, i) => {
                        const sc  = STATUS_CFG[r.status]    ?? STATUS_CFG.pending;
                        const sev = SEV_CFG[r.severity]     ?? SEV_CFG.low;
                        return (
                          <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10,
                            padding:'10px 0',
                            borderBottom: i < dash.recent_reports.length-1 ? `1px solid ${C.border}` : 'none' }}>
                            <span style={{ width:8, height:8, borderRadius:'50%',
                              background:sev.dot, flexShrink:0 }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                                fontWeight:600, color:C.textDk,
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {r.title}
                              </p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                                color:C.textLt, marginTop:2 }}>{r.user?.name}</p>
                            </div>
                            <StatusBadge status={r.status} cfg={sc}/>
                          </div>
                        );
                      })
                    : <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        color:C.textLt, textAlign:'center', padding:'20px 0' }}>
                        Belum ada laporan.
                      </p>
                  }
                </div>

                {/* Recent Donations */}
                <div className="ov-card" style={{ background:'#fff', borderRadius:20,
                  border:`1px solid ${C.border}`, padding:'20px 22px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk }}>
                      Donasi Terbaru
                    </p>
                    <button onClick={() => setTab('donations')}
                      style={{ display:'flex', alignItems:'center', gap:3,
                        fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.greenMd,
                        fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>
                      Lihat <ChevronRight size={13}/>
                    </button>
                  </div>
                  {dash?.recent_donations?.length > 0
                    ? dash.recent_donations.map((d, i) => {
                        const ds = DON_STATUS[d.status] ?? DON_STATUS.pending;
                        return (
                          <div key={d.id} style={{ display:'flex', alignItems:'center', gap:10,
                            padding:'10px 0',
                            borderBottom: i < dash.recent_donations.length-1 ? `1px solid ${C.border}` : 'none' }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:'#f0fdf4',
                              border:'1px solid #bbf7d0',
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <TreePine size={14} color={C.greenMd}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                                fontWeight:600, color:C.textDk,
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {d.user?.name ?? d.donor_name ?? 'Anonim'}
                              </p>
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                                color:C.textLt, marginTop:2 }}>
                                {d.trees_count} pohon · {d.amount_formatted ?? `Rp ${d.amount?.toLocaleString('id')}`}
                              </p>
                            </div>
                            <StatusBadge status={d.status} cfg={ds}/>
                          </div>
                        );
                      })
                    : <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                        color:C.textLt, textAlign:'center', padding:'20px 0' }}>
                        Belum ada donasi.
                      </p>
                  }
                </div>
              </div>

              {/* Status breakdown */}
              <div style={{ background:'#fff', borderRadius:20,
                border:`1px solid ${C.border}`, padding:'20px 22px' }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                  color:C.textDk, marginBottom:16 }}>Breakdown Status Laporan</p>
                <div className="status-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {STATUS_OPTIONS.map(s => {
                    const sc  = STATUS_CFG[s];
                    const val = dash?.reports?.[s] ?? 0;
                    const max = Math.max(...STATUS_OPTIONS.map(x => dash?.reports?.[x] ?? 0), 1);
                    return (
                      <div key={s} style={{ background:sc.bg, borderRadius:16, padding:'16px' }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
                          color:sc.text, fontWeight:700, letterSpacing:'.5px',
                          textTransform:'uppercase', marginBottom:6 }}>{sc.label}</p>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontSize:30,
                          fontWeight:800, color:sc.text, lineHeight:1, marginBottom:8 }}>
                          {val}
                        </p>
                        <div style={{ height:3, borderRadius:99, background:'rgba(0,0,0,.08)', overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:99, background:sc.dot ?? sc.text,
                            width:`${(val/max)*100}%`, transition:'width .7s ease' }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════ REPORTS TAB ════ */}
          {!loading && tab === 'reports' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Filter row */}
              <div className="filter-row hide-scroll" style={{ display:'flex', gap:7, flexWrap:'wrap', paddingBottom:4 }}>
                {['all', ...STATUS_OPTIONS].map(s => (
                  <button key={s}
                    className={`filter-btn ${repFilter === s ? 'active' : ''}`}
                    onClick={() => setRepFilter(s)}>
                    {s === 'all' ? 'Semua' : (STATUS_CFG[s]?.label ?? s)}
                  </button>
                ))}
              </div>

              {reports.length > 0
                ? reports.map(r => {
                    const sc  = STATUS_CFG[r.status]    ?? STATUS_CFG.pending;
                    const sev = SEV_CFG[r.severity]     ?? SEV_CFG.low;
                    return (
                      <div key={r.id} className="rep-card">
                        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                          {/* Thumbnail — hidden on mobile via .rep-img */}
                          {r.photo_url && (
                            <img className="rep-img" src={r.photo_url} alt=""
                              style={{ width:68, height:68, objectFit:'cover',
                                borderRadius:13, flexShrink:0,
                                border:`1px solid ${C.border}` }}/>
                          )}
                          <div style={{ flex:1, minWidth:0 }}>
                            {/* Badges */}
                            <div style={{ display:'flex', alignItems:'center', gap:7,
                              flexWrap:'wrap', marginBottom:7 }}>
                              <StatusBadge status={r.status} cfg={sc}/>
                              <span style={{ display:'flex', alignItems:'center', gap:4,
                                fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt }}>
                                <span style={{ width:6, height:6, borderRadius:'50%',
                                  background:sev.dot, display:'inline-block' }}/>
                                {sev.label}
                              </span>
                            </div>
                            {/* Title */}
                            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15,
                              fontWeight:700, color:C.textDk, lineHeight:1.3, marginBottom:5 }}>
                              {r.title}
                            </h3>
                            {/* Meta */}
                            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                              color:C.textLt, lineHeight:1.5 }}>
                              {r.user?.name}
                              {r.location_text && ` · ${r.location_text}`}
                              {' · '}{new Date(r.created_at).toLocaleDateString('id-ID',
                                { day:'numeric', month:'short', year:'numeric' })}
                            </p>
                            {/* Description */}
                            {r.description && (
                              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                                color:C.textMd, lineHeight:1.7, marginTop:7,
                                display:'-webkit-box', WebkitLineClamp:2,
                                WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                {r.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="rep-actions" style={{ display:'flex', gap:7,
                          flexWrap:'wrap', marginTop:14, paddingTop:12,
                          borderTop:`1px solid ${C.border}`, alignItems:'center' }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12,
                            color:C.textLt, flexShrink:0 }}>Ubah ke:</p>
                          {STATUS_OPTIONS.filter(s => s !== r.status).map(s => (
                            <button key={s} className="action-btn"
                              onClick={() => updateStatus(r.id, s)}>
                              {STATUS_CFG[s]?.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                : (
                  <div style={{ background:'#fff', borderRadius:20,
                    border:`1px solid ${C.border}`, padding:'52px 28px', textAlign:'center' }}>
                    <CheckCircle size={38} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                      color:C.textDk, marginBottom:6 }}>Tidak ada laporan</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
                      Tidak ada laporan dengan filter ini.
                    </p>
                  </div>
                )
              }
            </div>
          )}

          {/* ════ DONATIONS TAB ════ */}
          {!loading && tab === 'donations' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:10 }}>

              {/* Filter row */}
              <div className="filter-row hide-scroll" style={{ display:'flex', gap:7,
                flexWrap:'wrap', paddingBottom:4 }}>
                {['all', 'paid', 'pending', 'failed', 'expired'].map(s => (
                  <button key={s}
                    className={`filter-btn ${donFilter === s ? 'active' : ''}`}
                    onClick={() => setDonFilter(s)}>
                    {s === 'all' ? 'Semua' : (DON_STATUS[s]?.label ?? s)}
                  </button>
                ))}
              </div>

              {donations.length > 0
                ? donations.map(d => {
                    const ds = DON_STATUS[d.status] ?? DON_STATUS.pending;
                    return (
                      <div key={d.id} className="don-row">
                        {/* Tree icon */}
                        <div style={{ width:44, height:44, borderRadius:12, flexShrink:0,
                          background:'#f0fdf4', border:'1px solid #bbf7d0',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <TreePine size={19} color={C.greenMd}/>
                        </div>

                        {/* Info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                            fontWeight:600, color:C.textDk, marginBottom:3,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {d.user?.name ?? d.donor_name ?? 'Anonim'}
                          </p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                            {d.trees_count} pohon
                            {(d.user?.email || d.donor_email) && ` · ${d.user?.email ?? d.donor_email}`}
                            {' · '}{new Date(d.created_at).toLocaleDateString('id-ID',
                              { day:'numeric', month:'short', year:'numeric' })}
                          </p>
                        </div>

                        {/* Amount + status */}
                        <div style={{ textAlign:'right', flexShrink:0,
                          display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15,
                            fontWeight:700, color:C.textDk }}>
                            {d.amount_formatted ?? `Rp ${d.amount?.toLocaleString('id')}`}
                          </p>
                          <StatusBadge status={d.status} cfg={ds}/>
                        </div>
                      </div>
                    );
                  })
                : (
                  <div style={{ background:'#fff', borderRadius:20,
                    border:`1px solid ${C.border}`, padding:'52px 28px', textAlign:'center' }}>
                    <Heart size={38} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                      color:C.textDk, marginBottom:6 }}>Tidak ada donasi</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>
                      Belum ada donasi dengan filter ini.
                    </p>
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