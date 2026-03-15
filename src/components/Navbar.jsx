import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TreePine, LogOut, User, ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

/* ── inject font once ──────────────────────────────────────────── */
if (!document.getElementById('nb-fonts')) {
  const l = document.createElement('link');
  l.id   = 'nb-fonts';
  l.rel  = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

const C = { green:'#1b3a2b', lime:'#b5e235', limeHov:'#c8f24d', textDk:'#111810' };

const CSS = `
  .nb-link {
    font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:400;
    color:rgba(255,255,255,.58); text-decoration:none; transition:color .2s;
  }
  .nb-link:hover { color:#fff; }
  .nb-link.hi    { color:${C.lime}; font-weight: 500; }

  .nb-btn-ol {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:${C.lime};
    padding:8px 8px 8px 18px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px;
    text-decoration:none; border:1.5px solid rgba(181,226,53,.5); cursor:pointer;
    transition:background .2s, border-color .2s, transform .2s;
    white-space:nowrap;
  }
  .nb-btn-ol:hover { background:rgba(181,226,53,.09); border-color:${C.lime}; transform:translateY(-1px); }
  .nb-btn-ol .ac {
    width:27px; height:27px; border-radius:50%;
    background:${C.lime}; color:${C.textDk};
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    font-size:14px; font-weight:700;
  }

  .nb-btn-solid {
    display:inline-flex; align-items:center; gap:8px;
    background:${C.lime}; color:${C.textDk};
    padding:8px 8px 8px 18px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:13px;
    text-decoration:none; border:none; cursor:pointer;
    transition:background .2s, transform .2s;
    white-space:nowrap;
  }
  .nb-btn-solid:hover { background:${C.limeHov}; transform:translateY(-1px); }
  .nb-btn-solid .ac {
    width:27px; height:27px; border-radius:50%;
    background:${C.textDk}; color:${C.lime};
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    font-size:14px;
  }

  /* mobile drawer */
  .nb-drawer {
    position:fixed; inset:0; z-index:9999;
    display:flex; flex-direction:column;
  }
  .nb-drawer-bg {
    position:absolute; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(4px);
  }
  .nb-drawer-panel {
    position:relative; z-index:1;
    width:min(320px,90vw); height:100%;
    background:#1b3a2b; padding:28px 24px;
    display:flex; flex-direction:column; gap:8px;
    box-shadow:4px 0 40px rgba(0,0,0,.4);
  }
  .nb-mob-link {
    display:flex; align-items:center; gap:10px;
    font-family:'DM Sans',sans-serif; font-size:15px; font-weight:400;
    color:rgba(255,255,255,.7); text-decoration:none; padding:10px 4px;
    border-bottom:1px solid rgba(255,255,255,.07); transition:color .2s;
  }
  .nb-mob-link:hover { color:#fff; }

  @media (max-width:768px) { .nb-desktop { display:none !important; } }
  @media (min-width:769px) { .nb-ham    { display:none !important; } }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Sampai jumpa!');
    navigate('/');
    setOpen(false);
  };

  /* nav links - Diurutkan berdasarkan standar UX profesional */
  const links = [
    { to: '/',           label: 'Home' },
    { to: '/map',        label: 'Peta' },
    { to: '/leaderboard',label: 'Peringkat' },
    { to: '/about',      label: 'Tentang' },
    { to: '/donate',     label: 'Donasi' },
  ];

  /* is home? → show inside dark-green section */
  const isHome = location.pathname === '/';

  return (
    <>
      <style>{CSS}</style>

      <nav style={{
        background: isHome ? 'transparent' : C.green,
        position: isHome ? 'absolute' : 'sticky',
        top:0, left:0, right:0, zIndex:50,
      }}>
        <div style={{
          maxWidth:1280, margin:'0 auto',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'20px 40px',
        }}>
          {/* ── Logo ── */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{
              width:34, height:34, borderRadius:9,
              background:C.lime, display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <TreePine size={18} color={C.textDk} strokeWidth={2.2} />
            </div>
            <span style={{
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18,
              color:'#fff', letterSpacing:'-.2px',
            }}>HutanKita</span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="nb-desktop" style={{ display:'flex', alignItems:'center', gap:28 }}>
            {links.map(l => {
              const isActive = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to} className={`nb-link ${isActive ? 'hi' : ''}`}>
                  {l.label}
                </Link>
              );
            })}
            
            {/* Lapor dan Admin Link Desktop */}
            {user && (
              <Link to="/report" className={`nb-link ${location.pathname === '/report' ? 'hi' : ''}`}>Mulai Lapor</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ display:'flex', alignItems:'center', gap:4 }} className={`nb-link ${location.pathname === '/admin' ? 'hi' : ''}`}>
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
          </div>

          {/* ── Desktop CTA ── */}
          <div className="nb-desktop" style={{ display:'flex', alignItems:'center', gap:12 }}>
            {user ? (
              <>
                <Link to="/profile" className={`nb-link ${location.pathname === '/profile' ? 'hi' : ''}`} style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <User size={14} /> {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background:'transparent', border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', gap:5,
                    fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(255,255,255,.45)',
                    transition:'color .2s', padding:0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.45)'}
                >
                  <LogOut size={15} />
                </button>
                <Link to="/report" className="nb-btn-solid">
                  Buat Laporan
                  <span className="ac">+</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nb-link">Masuk</Link>
                <Link to="/register" className="nb-btn-ol">
                  Mulai Gratis
                  <span className="ac"><ArrowRight size={14} color={C.black}/></span>
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger ── */}
          <button
            className="nb-ham"
            onClick={() => setOpen(true)}
            style={{
              background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)',
              borderRadius:10, padding:'8px', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'rgba(255,255,255,.8)',
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="nb-drawer">
          <div className="nb-drawer-bg" onClick={() => setOpen(false)} />
          <div className="nb-drawer-panel">
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:C.lime, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <TreePine size={15} color={C.textDk} />
                </div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#fff' }}>
                  HutanKita
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background:'rgba(255,255,255,.08)', border:'none', borderRadius:8, padding:'6px', cursor:'pointer', color:'rgba(255,255,255,.7)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Links */}
            {links.map(l => {
              const isActive = location.pathname === l.to;
              return (
                <Link 
                  key={l.to} 
                  to={l.to} 
                  className="nb-mob-link" 
                  onClick={() => setOpen(false)}
                  style={isActive ? { color: C.lime, fontWeight: 500 } : {}}
                >
                  {l.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <Link to="/report"  className="nb-mob-link" onClick={() => setOpen(false)} style={{ color:C.lime }}>+ Buat Laporan</Link>
                <Link to="/profile" className="nb-mob-link" onClick={() => setOpen(false)} style={location.pathname === '/profile' ? { color: C.lime } : {}}>Profil Saya</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nb-mob-link" onClick={() => setOpen(false)} style={{ color:'#fbbf24' }}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} style={{
                  background:'transparent', border:'none', cursor:'pointer', textAlign:'left',
                  fontFamily:"'DM Sans',sans-serif", fontSize:15, color:'#fca5a5',
                  padding:'10px 4px', width:'100%',
                }}>Keluar</button>
              </>
            ) : (
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                <Link to="/login"    onClick={() => setOpen(false)} className="nb-btn-ol" style={{ justifyContent:'center' }}>Masuk</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="nb-btn-solid" style={{ justifyContent:'center' }}>
                  Daftar Sekarang <span className="ac">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}