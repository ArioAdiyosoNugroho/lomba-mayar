import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { TreePine, ArrowRight, Eye, EyeOff } from 'lucide-react';

if (!document.getElementById('auth-fonts')) {
  const l = document.createElement('link');
  l.id = 'auth-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(l);
}

const C = {
  green:'#1b3a2b', greenMd:'#2d6a4f', lime:'#b5e235', limeHov:'#c8f24d',
  offWhite:'#f5f5f0', textDk:'#0f1a10', textMd:'#4a5544', textLt:'#8a9984',
  border:'rgba(0,0,0,.08)',
};

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow:hidden}

  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .fu{animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both}
  .d1{animation-delay:.05s}.d2{animation-delay:.14s}

  .auth-input{
    width:100%;background:#fff;border:1.5px solid ${C.border};
    border-radius:12px;padding:11px 16px;font-family:'DM Sans',sans-serif;
    font-size:13.5px;color:${C.textDk};outline:none;
    transition:border-color .2s,box-shadow .2s;
  }
  .auth-input:focus{border-color:${C.greenMd};box-shadow:0 0 0 3px rgba(45,106,79,.08)}
  .auth-input::placeholder{color:${C.textLt}}
  .auth-input.err{border-color:#ef4444}

  .auth-label{
    display:block;font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:700;
    color:${C.textLt};letter-spacing:1.1px;text-transform:uppercase;margin-bottom:6px;
  }

  .btn-lime{
    display:flex;align-items:center;justify-content:center;gap:10px;width:100%;
    background:${C.lime};color:${C.textDk};border:none;cursor:pointer;
    padding:12px 12px 12px 24px;border-radius:99px;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
    transition:background .2s,transform .2s,box-shadow .2s;
  }
  .btn-lime:hover:not(:disabled){background:${C.limeHov};transform:translateY(-2px);box-shadow:0 10px 28px rgba(181,226,53,.28)}
  .btn-lime:disabled{opacity:.5;cursor:not-allowed}
  .btn-lime .ac{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:${C.textDk};display:flex;align-items:center;justify-content:center}

  .ticker-track{display:flex;width:max-content;animation:ticker 30s linear infinite}
  .ticker-track:hover{animation-play-state:paused}

  @media(max-width:768px){
    html,body{overflow:auto}
    .auth-left{display:none!important}
    .auth-right{padding:36px 24px!important;height:auto!important;min-height:100vh}
  }
`;

const STATS = [
  { v:'12.400+', l:'Laporan Aktif' },
  { v:'87.500',  l:'Pohon Ditanam' },
  { v:'3.200+',  l:'Relawan' },
];

const TICKER_ITEMS = [
  'Pembukaan Lahan · Kalimantan',
  'Kebakaran Hutan · Riau',
  'Penebangan Liar · Sumatera',
  'Ekspansi Sawit · Kalimantan Tengah',
  'Tambang Ilegal · Sulawesi',
];

function AuthLayout({ title, subtitle, children, isRegister }) {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

        {/* ── Kiri ── */}
        <div className="auth-left" style={{
          width:'45%', flexShrink:0, position:'relative',
          display:'flex', flexDirection:'column', overflow:'hidden',
          background:C.green,
        }}>
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&auto=format&fit=crop&q=70"
            alt=""
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.18 }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,#1b3a2b 0%,#0d2218 100%)', opacity:.88 }}/>

          {/* Main content */}
          <div style={{ position:'relative', zIndex:1, flex:1, padding:'44px 48px', display:'flex', flexDirection:'column', justifyContent:'center', gap:32 }}>

            {/* Headline */}
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:clampFontSize(), lineHeight:.97, letterSpacing:'-2px', color:'#fff', marginBottom:14 }}>
                Lindungi<br/>Hutan,<br/><span style={{ color:C.lime }}>Bersama.</span>
              </h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:'rgba(255,255,255,.4)', lineHeight:1.75, maxWidth:280 }}>
                Bergabung dengan ribuan pejuang hutan yang memantau dan memulihkan hutan Indonesia.
              </p>
            </div>

            {/* Stats — compact */}
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {STATS.map(({ v, l }) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:14, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:'11px 18px' }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:C.lime, lineHeight:1 }}>{v}</span>
                  <div style={{ width:1, height:18, background:'rgba(255,255,255,.1)' }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,.38)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker */}
          <div style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,.07)', padding:'12px 0', overflow:'hidden', background:'rgba(0,0,0,.15)', flexShrink:0 }}>
            <div className="ticker-track">
              {doubled.map((t, i) => (
                <span key={i} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'rgba(255,255,255,.25)', padding:'0 32px', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:9 }}>
                  <span style={{ width:4, height:4, borderRadius:'50%', background:C.lime, display:'inline-block', flexShrink:0 }}/>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Kanan ── */}
        <div className="auth-right" style={{
          flex:1, background:C.offWhite,
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'40px 48px', height:'100vh', overflow:'hidden',
        }}>
          <div style={{ width:'100%', maxWidth:390 }}>

            {/* Header — compact */}
            <div className="fu d1" style={{ marginBottom: isRegister ? 22 : 28 }}>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:C.textDk, letterSpacing:'-1.2px', lineHeight:1.05, marginBottom:7 }}>
                {title}
              </h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, lineHeight:1.55 }}>
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

// Helper — font size responsif tanpa media query JS
function clampFontSize() { return 'clamp(38px, 3.5vw, 50px)'; }

/* ══ LOGIN ══ */
export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
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
    <AuthLayout title="Masuk" subtitle="Lanjutkan misi menjaga hutan Indonesia." isRegister={false}>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:11, padding:'10px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#b91c1c' }}>
            {error}
          </div>
        )}
        <div>
          <label className="auth-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nama@email.com" className="auth-input"/>
        </div>
        <div>
          <label className="auth-label">Password</label>
          <div style={{ position:'relative' }}>
            <input type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password kamu" className="auth-input" style={{ paddingRight:46 }}/>
            <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textLt }}>
              {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>
        <button className="btn-lime" type="submit" disabled={loading} style={{ marginTop:6 }}>
          {loading ? 'Masuk...' : <>Masuk <span className="ac"><ArrowRight size={14} color={C.lime}/></span></>}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, height:1, background:C.border }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt }}>atau</span>
          <div style={{ flex:1, height:1, background:C.border }}/>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, textAlign:'center' }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color:C.greenMd, fontWeight:700, textDecoration:'none' }}>Daftar sekarang →</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

/* ══ REGISTER ══ */
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
    { key:'name',                  label:'Nama Lengkap',        type:'text',     ph:'Nama lengkap kamu' },
    { key:'email',                 label:'Email',               type:'email',    ph:'nama@email.com' },
    { key:'password',              label:'Password',            type:'password', ph:'Min. 8 karakter' },
    { key:'password_confirmation', label:'Konfirmasi Password', type:'password', ph:'Ulangi password' },
  ];

  return (
    <AuthLayout title="Bergabung" subtitle="Jadilah pejuang hutan Indonesia." isRegister>
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {FIELDS.map(({ key, label, type, ph }) => (
          <div key={key}>
            <label className="auth-label">{label}</label>
            <div style={{ position:'relative' }}>
              <input
                type={type==='password'?(showPw?'text':'password'):type}
                value={form[key]} onChange={e => set(key, e.target.value)} required
                placeholder={ph}
                className={`auth-input${errors[key]?' err':''}`}
                style={type==='password'?{paddingRight:46}:{}}
              />
              {type==='password' && key==='password' && (
                <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.textLt }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              )}
            </div>
            {errors[key] && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:'#ef4444', marginTop:3 }}>{errors[key][0]}</p>}
          </div>
        ))}
        <button className="btn-lime" type="submit" disabled={loading} style={{ marginTop:8 }}>
          {loading ? 'Mendaftar...' : <>Daftar Sekarang <span className="ac"><ArrowRight size={14} color={C.lime}/></span></>}
        </button>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt, textAlign:'center', marginTop:2 }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color:C.greenMd, fontWeight:700, textDecoration:'none' }}>Masuk di sini →</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;