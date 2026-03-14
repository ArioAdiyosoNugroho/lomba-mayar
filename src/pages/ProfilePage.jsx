import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TreePine, FileText, Heart, ArrowRight, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';

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

const STATUS_DON = {
  paid:    { bg:'#f0fdf4', text:'#15803d', label:'Lunas ' },
  pending: { bg:'#fffbeb', text:'#b45309', label:'Menunggu ' },
  failed:  { bg:'#fef2f2', text:'#b91c1c', label:'Gagal ' },
};

const STATUS_REP = {
  pending:  { bg:'#fffbeb', text:'#b45309', label:'Menunggu',      icon:Clock },
  verified: { bg:'#f0fdf4', text:'#15803d', label:'Terverifikasi', icon:CheckCircle },
  resolved: { bg:'#eff6ff', text:'#1d4ed8', label:'Selesai',       icon:CheckCircle },
  rejected: { bg:'#fef2f2', text:'#b91c1c', label:'Ditolak',       icon:XCircle },
};

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .fu{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}
  .d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.22s}
  .tab-btn{display:flex;align-items:center;gap:7px;padding:9px 20px;border-radius:99px;border:none;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap}
  .tab-btn.active{background:${C.green};color:#fff}
  .tab-btn.inactive{background:transparent;color:${C.textLt}}
  .tab-btn.inactive:hover{background:rgba(0,0,0,.05);color:${C.textDk}}
  .don-row{display:flex;align-items:center;gap:16px;background:#fff;border:1px solid ${C.border};border-radius:18px;padding:16px 20px;transition:box-shadow .2s}
  .don-row:hover{box-shadow:0 6px 20px rgba(0,0,0,.06)}
  .rep-row{display:flex;align-items:flex-start;gap:16px;background:#fff;border:1px solid ${C.border};border-radius:18px;padding:16px 20px;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}
  .rep-row:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.07)}
  .btn-lime{display:inline-flex;align-items:center;gap:8px;background:${C.lime};color:${C.textDk};padding:11px 11px 11px 22px;border-radius:99px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;text-decoration:none;border:none;cursor:pointer;transition:background .2s,transform .2s}
  .btn-lime:hover{background:${C.limeHov};transform:translateY(-2px)}
  .btn-lime .ac{width:30px;height:30px;border-radius:50%;background:${C.textDk};display:flex;align-items:center;justify-content:center}
  @media(max-width:640px){.hero-h1{font-size:40px!important}.stat-cards{grid-template-columns:1fr 1fr!important}.page-wrap{padding:24px 16px 64px!important}.hero-inner{padding:16px 20px 40px!important}}
`;

export default function ProfilePage() {
  const { user }              = useAuth();
  const [donations, setDon]   = useState([]);
  const [reports,   setRep]   = useState([]);
  const [tab,       setTab]   = useState('donations');
  const [loading,   setLoad]  = useState(true);
  const [error,     setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoad(true);
    setError(null);

    Promise.all([
      // Donasi: pakai endpoint /donations/my yang sudah filter by user di backend
      api.get('/donations/my'),
      // Laporan: filter by user_id langsung di query param
      api.get(`/reports?user_id=${user.id}&per_page=50`),
    ]).then(([d, r]) => {
      // donations/my sudah pasti milik user ini
      const dons = d.data?.data || d.data || [];
      setDon(Array.isArray(dons) ? dons : []);

      // laporan: filter ulang di frontend jaga-jaga
      const reps = r.data?.data || r.data || [];
      const myReps = Array.isArray(reps)
        ? reps.filter(x => !x.user_id || x.user_id === user.id || x.user?.id === user.id)
        : [];
      setRep(myReps);
      setLoad(false);
    }).catch(err => {
      console.error('Profile fetch error:', err);
      setError('Gagal memuat data. Coba refresh halaman.');
      setLoad(false);
    });
  }, [user]);

  const initials   = user?.name?.[0]?.toUpperCase() || '?';
  const totalTrees = donations.filter(d => d.status === 'paid').reduce((s, d) => s + (d.trees_count || 0), 0);

  return (
    <>
      <style>{CSS}</style>

      {/* HERO */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="hero-inner fu d1" style={{ padding:'20px 60px 52px', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:32, flexWrap:'wrap' }}>
            {/* Avatar + nama */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:24 }}>
              <div style={{ width:88, height:88, borderRadius:'50%', background:`linear-gradient(135deg,${C.greenMd},${C.green})`, border:'3px solid rgba(181,226,53,.35)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontSize:36, fontWeight:800, color:C.lime, flexShrink:0, boxShadow:'0 8px 28px rgba(0,0,0,.3)' }}>
                {initials}
              </div>
              <div style={{ paddingBottom:4 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(181,226,53,.15)', border:'1px solid rgba(181,226,53,.22)', borderRadius:99, padding:'4px 12px', marginBottom:10 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.lime, fontWeight:600 }}>Member Aktif</span>
                </div>
                <h1 className="hero-h1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:52, lineHeight:.96, letterSpacing:'-2px', color:'#fff' }}>{user?.name}</h1>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:'rgba(255,255,255,.4)', marginTop:8 }}>{user?.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="stat-cards" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { val: totalTrees || user?.total_trees_planted || 0, label:'Pohon Ditanam', color:C.lime },
                { val: donations.length, label:'Total Donasi', color:'#fbbf24' },
                { val: reports.length,   label:'Laporan Dibuat', color:'#60a5fa' },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:'16px 18px', textAlign:'center' }}>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color, lineHeight:1 }}>{val}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.38)', marginTop:5 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'32px 60px 80px' }}>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', marginBottom:20, color:'#b91c1c', fontSize:13 }}>
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="fu d2" style={{ display:'inline-flex', gap:4, background:'#fff', border:`1px solid ${C.border}`, borderRadius:99, padding:5, marginBottom:24 }}>
            {[
              { key:'donations', label:'Riwayat Donasi', icon:Heart },
              { key:'reports',   label:'Laporan Saya',   icon:FileText },
            ].map(({ key, label, icon:Icon }) => (
              <button key={key} className={`tab-btn ${tab===key?'active':'inactive'}`} onClick={() => setTab(key)}>
                <Icon size={14}/> {label}
                <span style={{ background: tab===key ? 'rgba(255,255,255,.2)' : C.border, borderRadius:99, padding:'1px 7px', fontSize:11, fontWeight:700 }}>
                  {key === 'donations' ? donations.length : reports.length}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:'center', padding:60 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', border:`3px solid ${C.border}`, borderTopColor:C.greenMd, animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
              <p style={{ color:C.textLt, fontSize:13 }}>Memuat data...</p>
            </div>
          )}

          {/* TAB Donasi */}
          {!loading && tab === 'donations' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {donations.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:22, border:`1px solid ${C.border}`, padding:'52px 32px', textAlign:'center' }}>
                  <TreePine size={40} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:C.textDk, marginBottom:8 }}>Belum ada donasi</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, marginBottom:20 }}>Tanam pohon pertamamu dan bantu pulihkan hutan Indonesia.</p>
                  <Link to="/donate" className="btn-lime">Donasi Pohon <span className="ac"><ArrowRight size={13} color={C.lime}/></span></Link>
                </div>
              ) : donations.map(d => {
                const st = STATUS_DON[d.status] ?? STATUS_DON.pending;
                return (
                  <div key={d.id} className="don-row">
                    <div style={{ width:46, height:46, borderRadius:13, flexShrink:0, background:'#f0fdf4', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <TreePine size={20} color={C.greenMd}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:600, color:C.textDk, marginBottom:3 }}>
                        {d.trees_count} pohon ditanam 
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                        {new Date(d.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                        {d.mayar_order_id && <span style={{ marginLeft:8, opacity:.5 }}>#{d.mayar_order_id?.slice(-6)}</span>}
                      </p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:4 }}>
                        {d.amount_formatted || `Rp ${d.amount?.toLocaleString('id')}`}
                      </p>
                      <span style={{ background:st.bg, color:st.text, borderRadius:99, padding:'3px 10px', fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB Laporan */}
          {!loading && tab === 'reports' && (
            <div className="fu d3" style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {reports.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:22, border:`1px solid ${C.border}`, padding:'52px 32px', textAlign:'center' }}>
                  <FileText size={40} color="rgba(0,0,0,.1)" style={{ marginBottom:14 }}/>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:C.textDk, marginBottom:8 }}>Belum ada laporan</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, marginBottom:20 }}>Laporkan deforestasi di sekitarmu.</p>
                  <Link to="/report" className="btn-lime">Buat Laporan <span className="ac"><ArrowRight size={13} color={C.lime}/></span></Link>
                </div>
              ) : reports.map(r => {
                const st = STATUS_REP[r.status] ?? STATUS_REP.pending;
                const StIcon = st.icon;
                return (
                  <Link key={r.id} to={`/reports/${r.id}`} className="rep-row">
                    <div style={{ width:46, height:46, borderRadius:13, flexShrink:0, background:st.bg, border:`1px solid ${st.text}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <StIcon size={18} color={st.text}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, fontWeight:600, color:C.textDk, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {r.title}
                      </p>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                        {r.location_text && (
                          <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                            <MapPin size={11} color={C.greenMd}/> {r.location_text}
                          </span>
                        )}
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
                          {new Date(r.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span style={{ background:st.bg, color:st.text, borderRadius:99, padding:'4px 12px', flexShrink:0, fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600 }}>
                      {st.label}
                    </span>
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