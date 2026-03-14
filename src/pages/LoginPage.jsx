import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TreePine, ArrowRight, Eye, EyeOff } from 'lucide-react';

if (!document.getElementById('auth-fonts')) {
  const l = document.createElement('link');
  l.id = 'auth-fonts'; l.rel = 'stylesheet';
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

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1{animation-delay:.08s} .d2{animation-delay:.18s}

  .auth-input {
    width:100%; background:#fff; border:1.5px solid ${C.border};
    border-radius:14px; padding:13px 18px; font-family:'DM Sans',sans-serif;
    font-size:14px; color:${C.textDk}; outline:none;
    transition:border-color .2s, box-shadow .2s;
  }
  .auth-input:focus { border-color:${C.greenMd}; box-shadow:0 0 0 3px rgba(45,106,79,.08); }
  .auth-input::placeholder { color:${C.textLt}; }
  .auth-input.err { border-color:#ef4444; }

  .auth-label {
    display:block; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
    color:${C.textLt}; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px;
  }

  .btn-lime {
    display:flex; align-items:center; justify-content:center; gap:10px; width:100%;
    background:${C.lime}; color:${C.textDk}; border:none; cursor:pointer;
    padding:13px 13px 13px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14.5px;
    transition:background .2s, transform .2s;
  }
  .btn-lime:hover:not(:disabled) { background:${C.limeHov}; transform:translateY(-2px); }
  .btn-lime:disabled { opacity:.5; cursor:not-allowed; }
  .btn-lime .ac {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }

  /* Hide left panel on mobile */
  @media (max-width:768px) {
    .auth-left  { display:none !important; }
    .auth-right { padding:36px 24px !important; }
  }
`;

/* ── Shared layout ─────────────────────────────────────────────── */
function AuthLayout({ title, subtitle, children }) {
  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* Left – dark green panel (matches HomePage header) */}
        <div className="auth-left" style={{
          width:'44%', background:C.green, padding:'60px 52px',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          position:'relative', overflow:'hidden', flexShrink:0,
        }}>
          <div style={{ position:'absolute', right:-80, top:-80, width:320, height:320, borderRadius:'50%', background:'rgba(181,226,53,.06)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', left:-60, bottom:-60, width:240, height:240, borderRadius:'50%', background:'rgba(181,226,53,.04)', pointerEvents:'none' }}/>

          <div style={{ position:'relative' }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:60 }}>
              <TreePine size={22} color={C.lime}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:'#fff' }}>HutanKita</span>
            </div>
            {/* Headline */}
            <h2 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:46,
              color:'#fff', lineHeight:.98, letterSpacing:'-2px', marginBottom:20,
            }}>
              Lindungi Hutan,<br/>Selamatkan<br/>
              <span style={{ color:C.lime }}>Masa Depan</span>
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,.45)', lineHeight:1.8, maxWidth:320 }}>
              Bergabunglah dengan ribuan pejuang hutan yang memantau,
              melaporkan, dan memulihkan hutan Indonesia.
            </p>
          </div>

          {/* Stats – same style as HeroStatsCard */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, position:'relative' }}>
            {[
              { v:'12.400+', l:'Laporan Aktif' },
              { v:'87.500',  l:'Pohon Ditanam' },
              { v:'3.200+',  l:'Relawan' },
            ].map(({ v, l }) => (
              <div key={l} style={{
                display:'flex', alignItems:'center', gap:14,
                background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:14, padding:'13px 18px',
              }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:C.lime }}>{v}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:'rgba(255,255,255,.45)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – offWhite, same as page body */}
        <div className="auth-right" style={{
          flex:1, background:C.offWhite,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'60px 48px',
        }}>
          <div style={{ width:'100%', maxWidth:420 }}>
            <div className="fu d1">
              <h1 style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:38,
                color:C.textDk, letterSpacing:'-1.5px', marginBottom:8,
              }}>{title}</h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt, marginBottom:36 }}>
                {subtitle}
              </p>
            </div>
            <div className="fu d2">{children}</div>
          </div>
        </div>

      </div>
    </>
  );
}

/* ── Login ─────────────────────────────────────────────────────── */
export function LoginPage() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(email, password);
      toast.success('Selamat datang kembali! 🌿');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Selamat Datang" subtitle="Lanjutkan misi menjaga hutan Indonesia">
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fecaca',
            borderRadius:12, padding:'12px 16px',
            fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#b91c1c',
          }}>{error}</div>
        )}
        <div>
          <label className="auth-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            required placeholder="nama@email.com" className="auth-input"/>
        </div>
        <div>
          <label className="auth-label">Password</label>
          <div style={{ position:'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="Password kamu"
              className="auth-input" style={{ paddingRight:48 }}/>
            <button type="button" onClick={() => setShowPw(v => !v)} style={{
              position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', color:C.textLt,
            }}>
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>
        <button className="btn-lime" type="submit" disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Masuk...' : 'Masuk'}
          {!loading && <span className="ac"><ArrowRight size={14} color={C.lime}/></span>}
        </button>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt, textAlign:'center', marginTop:4 }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color:C.greenMd, fontWeight:600, textDecoration:'none' }}>Daftar sekarang</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

/* ── Register ──────────────────────────────────────────────────── */
export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ name:'', email:'', password:'', password_confirmation:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setErrors({}); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      toast.success('Akun berhasil dibuat! Selamat bergabung 🌿');
      navigate('/');
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors);
      else toast.error('Gagal membuat akun.');
    } finally { setLoading(false); }
  };

  const FIELDS = [
    { key:'name',                  label:'Nama Lengkap',       type:'text',     ph:'Nama kamu' },
    { key:'email',                 label:'Email',              type:'email',    ph:'nama@email.com' },
    { key:'password',              label:'Password',           type:'password', ph:'Min. 8 karakter' },
    { key:'password_confirmation', label:'Konfirmasi Password',type:'password', ph:'Ulangi password' },
  ];

  return (
    <AuthLayout title="Bergabung" subtitle="Jadilah pejuang hutan Indonesia">
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {FIELDS.map(({ key, label, type, ph }) => (
          <div key={key}>
            <label className="auth-label">{label}</label>
            <div style={{ position:'relative' }}>
              <input
                type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                value={form[key]} onChange={e => set(key, e.target.value)} required
                placeholder={ph}
                className={`auth-input${errors[key] ? ' err' : ''}`}
                style={type === 'password' ? { paddingRight:48 } : {}}
              />
              {type === 'password' && key === 'password' && (
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:C.textLt,
                }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              )}
            </div>
            {errors[key] && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#ef4444', marginTop:5 }}>{errors[key][0]}</p>}
          </div>
        ))}
        <button className="btn-lime" type="submit" disabled={loading} style={{ marginTop:6 }}>
          {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          {!loading && <span className="ac"><ArrowRight size={14} color={C.lime}/></span>}
        </button>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt, textAlign:'center', marginTop:4 }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color:C.greenMd, fontWeight:600, textDecoration:'none' }}>Masuk di sini</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;