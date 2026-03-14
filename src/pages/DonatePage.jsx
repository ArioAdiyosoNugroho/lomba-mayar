import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Heart, Loader, ArrowRight, Leaf, CheckCircle, TreePine } from 'lucide-react';

if (!document.getElementById('donate-fonts')) {
  const l = document.createElement('link');
  l.id = 'donate-fonts'; l.rel = 'stylesheet';
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

const PACKAGES = [
  { trees: 1,   amount: 5000,   label: '1 Pohon',   emoji: '🌱' },
  { trees: 5,   amount: 25000,  label: '5 Pohon',   emoji: '🌿', popular: true },
  { trees: 10,  amount: 50000,  label: '10 Pohon',  emoji: '🌳' },
  { trees: 20,  amount: 100000, label: '20 Pohon',  emoji: '🌲' },
  { trees: 100, amount: 500000, label: '100 Pohon', emoji: '🏕️' },
];

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1 { animation-delay:.06s; }
  .d2 { animation-delay:.14s; }

  .pkg-pill {
    display:flex; align-items:center; gap:12px;
    padding:14px 16px; border-radius:14px;
    border:2px solid ${C.border}; background:#fff;
    cursor:pointer; transition:all .2s; width:100%; text-align:left;
  }
  .pkg-pill:hover { border-color:${C.greenMd}; background:rgba(45,106,79,.03); }
  .pkg-pill.active { border-color:${C.green}; background:${C.green}; }

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

  .btn-pay {
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:16px 16px 16px 28px; border-radius:99px; width:100%;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:15.5px;
    border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
  }
  .btn-pay:hover:not(:disabled) {
    background:${C.limeHov}; transform:translateY(-2px);
    box-shadow:0 12px 32px rgba(181,226,53,.35);
  }
  .btn-pay:disabled { opacity:.45; cursor:not-allowed; }
  .btn-pay .ic {
    width:42px; height:42px; border-radius:50%; background:${C.textDk}; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; transition:transform .2s;
  }
  .btn-pay:hover:not(:disabled) .ic { transform:translateX(3px); }

  @media (max-width:1024px) {
    .donate-grid { grid-template-columns:1fr !important; }
    .right-sticky { position:static !important; }
    .hero-content { padding:20px 28px 52px !important; }
  }
  @media (max-width:600px) {
    .hero-content { padding:20px 20px 44px !important; }
    .hero-title   { font-size:44px !important; letter-spacing:-1.5px !important; }
    .hero-stats   { gap:20px !important; }
    .pkg-grid     { grid-template-columns:repeat(3,1fr) !important; }
    .page-wrap    { padding:24px 16px 64px !important; }
  }
`;

export default function DonatePage() {
  const { user } = useAuth();
  const [selected,  setSelected]  = useState(PACKAGES[1]);
  const [custom,    setCustom]    = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [name,      setName]      = useState(user?.name  || '');
  const [email,     setEmail]     = useState(user?.email || '');
  const [message,   setMessage]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const amount     = useCustom ? parseInt(custom || 0) : selected.amount;
  const treesCount = Math.floor(amount / 5000);

  const checkout = async () => {
    if (amount < 5000) { toast.error('Minimal donasi Rp 5.000.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/donations/order', {
        amount,
        donor_name: name || undefined,
        donor_email: email || undefined,
        donor_message: message || undefined,
      });
      toast.success('Mengarahkan ke pembayaran...');
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat order.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO dengan foto background ══════════════════════════════ */}
      <div style={{ position:'relative', overflow:'hidden', minHeight:340, background:C.green }}>

        {/* Foto hutan */}
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

        {/* Overlay gradient terarah kiri→kanan */}
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
        <div style={{
          position:'absolute', right:-60, top:-60,
          width:320, height:320, borderRadius:'50%',
          background:'rgba(181,226,53,.07)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', right:140, bottom:50,
          width:160, height:160, borderRadius:'50%',
          border:'1px solid rgba(181,226,53,.13)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', right:185, bottom:85,
          width:70, height:70, borderRadius:'50%',
          border:'1px solid rgba(181,226,53,.20)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', left:'38%', top:30,
          width:6, height:6, borderRadius:'50%',
          background:'rgba(181,226,53,.35)', pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', left:'52%', bottom:48,
          width:4, height:4, borderRadius:'50%',
          background:'rgba(181,226,53,.25)', pointerEvents:'none',
        }}/>

        {/* Content */}
        <div style={{ maxWidth:1280, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-content" style={{
            padding:'20px 60px 56px',
            display:'flex', alignItems:'flex-end',
            justifyContent:'space-between', gap:32, flexWrap:'wrap',
          }}>

            <div>

              {/* Judul */}
              <h1 className="hero-title" style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:64, lineHeight:.96, letterSpacing:'-2.5px', color:'#fff',
              }}>
                Tanam Pohon,<br/>
                <span style={{ color:C.lime }}>Sekarang</span>
              </h1>

              {/* Stats bar */}
              <div className="hero-stats" style={{
                display:'flex', gap:32, marginTop:28, flexWrap:'wrap',
              }}>
                {[
                  { v:'87.500+', l:'Pohon Ditanam' },
                  { v:'3.200+',  l:'Donatur Aktif' },
                  { v:'34',      l:'Provinsi' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p style={{
                      fontFamily:"'Syne',sans-serif", fontSize:24,
                      fontWeight:800, color:C.lime, lineHeight:1,
                    }}>{v}</p>
                    <p style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                      color:'rgba(255,255,255,.42)', marginTop:4,
                    }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanan: deskripsi */}
            <p className="fu d2" style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.85,
              color:'rgba(255,255,255,.48)', maxWidth:255, paddingBottom:6,
            }}>
              Setiap pohon dipantau via satelit dan dicatat transparan untuk hutan Indonesia.
            </p>

          </div>
        </div>
      </div>

      {/* ══ TWO-COLUMN LAYOUT ════════════════════════════════════════ */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'40px 60px 80px' }}>
          <div className="donate-grid" style={{
            display:'grid', gridTemplateColumns:'1fr 380px', gap:28, alignItems:'start',
          }}>

            {/* ── LEFT: Package picker + Donor info ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Package list */}
              <div className="fu d1" style={{
                background:'#fff', borderRadius:22,
                border:`1px solid ${C.border}`, padding:'28px 28px',
              }}>
                <p style={{
                  fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:6,
                }}>Pilih Jumlah Pohon</p>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                  color:C.textLt, marginBottom:20,
                }}>Setiap pohon ditanam nyata di lahan terdeforestasi</p>

                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {PACKAGES.map(p => (
                    <button
                      key={p.amount}
                      className={`pkg-pill${!useCustom && selected.amount === p.amount ? ' active' : ''}`}
                      onClick={() => { setSelected(p); setUseCustom(false); }}
                    >
                      <span style={{ fontSize:22, flexShrink:0 }}>{p.emoji}</span>
                      <div style={{ flex:1 }}>
                        <span style={{
                          fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
                          color: !useCustom && selected.amount === p.amount ? '#fff' : C.textDk,
                        }}>{p.label}</span>
                        {p.popular && (
                          <span style={{
                            marginLeft:8, background:C.lime, color:C.textDk,
                            fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          }}>Populer</span>
                        )}
                      </div>
                      <span style={{
                        fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14,
                        color: !useCustom && selected.amount === p.amount ? C.lime : C.greenMd,
                        flexShrink:0,
                      }}>Rp {p.amount.toLocaleString('id')}</span>
                      {!useCustom && selected.amount === p.amount && (
                        <CheckCircle size={18} color={C.lime} style={{ flexShrink:0 }}/>
                      )}
                    </button>
                  ))}

                  {/* Custom */}
                  <button
                    className={`pkg-pill${useCustom ? ' active' : ''}`}
                    onClick={() => setUseCustom(true)}
                  >
                    <span style={{ fontSize:22, flexShrink:0 }}>✏️</span>
                    <span style={{
                      fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, flex:1,
                      color: useCustom ? '#fff' : C.textDk,
                    }}>Nominal Sendiri</span>
                    {useCustom && <CheckCircle size={18} color={C.lime} style={{ flexShrink:0 }}/>}
                  </button>

                  {useCustom && (
                    <div style={{ paddingTop:4, position:'relative' }}>
                      <span style={{
                        position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
                        fontFamily:"'DM Sans',sans-serif", fontSize:14,
                        color:C.textLt, fontWeight:500,
                      }}>Rp</span>
                      <input
                        type="number" value={custom}
                        onChange={e => setCustom(e.target.value)}
                        min={5000} step={5000} placeholder="Masukkan nominal"
                        className="f-input" style={{ paddingLeft:44 }} autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Donor info */}
              <div className="fu d2" style={{
                background:'#fff', borderRadius:22,
                border:`1px solid ${C.border}`, padding:'28px 28px',
              }}>
                <p style={{
                  fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:6,
                }}>Informasi Donatur</p>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                  color:C.textLt, marginBottom:20,
                }}>Opsional — untuk bukti donasi dan nama di leaderboard</p>

                <div style={{
                  display:'grid', gridTemplateColumns:'1fr 1fr',
                  gap:14, marginBottom:14,
                }}>
                  <div>
                    <label className="f-label">Nama</label>
                    <input
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Nama kamu" className="f-input"
                    />
                  </div>
                  <div>
                    <label className="f-label">Email</label>
                    <input
                      value={email} onChange={e => setEmail(e.target.value)}
                      type="email" placeholder="nama@email.com" className="f-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="f-label">Pesan untuk Hutan Indonesia</label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    rows={3} placeholder="Tuliskan pesanmu... (opsional)"
                    className="f-input" style={{ resize:'none' }}
                  />
                </div>
              </div>
            </div>

            {/* ── RIGHT: Sticky summary + checkout ── */}
            <div className="right-sticky" style={{
              position:'sticky',
              top:96,
              display:'flex', flexDirection:'column', gap:16,
            }}>

              {/* Order summary */}
              <div className="fu d1" style={{
                background:C.green, borderRadius:22, padding:'28px',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{
                  position:'absolute', right:-30, top:-30,
                  width:140, height:140, borderRadius:'50%',
                  background:'rgba(181,226,53,.07)', pointerEvents:'none',
                }}/>

                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
                  color:'rgba(255,255,255,.4)', letterSpacing:'.8px',
                  textTransform:'uppercase', marginBottom:16,
                }}>Ringkasan Donasi</p>

                {/* Trees big number */}
                <div style={{
                  textAlign:'center', padding:'20px 0 24px',
                  borderBottom:'1px solid rgba(255,255,255,.1)', marginBottom:20,
                }}>
                  {treesCount > 0 ? (
                    <>
                      <p style={{
                        fontFamily:"'Syne',sans-serif", fontSize:72,
                        fontWeight:800, color:C.lime, lineHeight:1,
                      }}>
                        {treesCount.toLocaleString('id')}
                      </p>
                      <p style={{
                        fontFamily:"'DM Sans',sans-serif", fontSize:15,
                        color:'rgba(255,255,255,.6)', marginTop:6,
                      }}>Pohon</p>
                    </>
                  ) : (
                    <div style={{ padding:'10px 0' }}>
                      <TreePine
                        size={48} color="rgba(255,255,255,.12)"
                        style={{ margin:'0 auto 8px', display:'block' }}
                      />
                      <p style={{
                        fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                        color:'rgba(255,255,255,.25)',
                      }}>Pilih paket untuk melihat ringkasan</p>
                    </div>
                  )}
                </div>

                {/* Summary rows */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:13,
                      color:'rgba(255,255,255,.45)',
                    }}>Paket dipilih</span>
                    <span style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
                      fontWeight:600, color:'rgba(255,255,255,.8)',
                    }}>
                      {useCustom ? 'Nominal Sendiri' : selected.label}
                    </span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{
                      fontFamily:"'DM Sans',sans-serif", fontSize:13,
                      color:'rgba(255,255,255,.45)',
                    }}>Total bayar</span>
                    <span style={{
                      fontFamily:"'Syne',sans-serif", fontSize:18,
                      fontWeight:800, color:'#fff',
                    }}>
                      {amount > 0 ? `Rp ${amount.toLocaleString('id')}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Trust badges */}
                <div style={{
                  marginTop:20, paddingTop:16,
                  borderTop:'1px solid rgba(255,255,255,.1)',
                }}>
                  {[
                    '🛰️ Dipantau via satelit',
                    '📊 Dicatat transparan',
                    '🌿 Pohon nyata ditanam',
                  ].map(t => (
                    <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{
                        fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                        color:'rgba(255,255,255,.4)', lineHeight:1.4,
                      }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pay button */}
              <button
                className="btn-pay fu d2"
                onClick={checkout}
                disabled={loading || amount < 5000}
              >
                {loading
                  ? <><Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Memproses...</>
                  : <><Heart size={18}/> Donasi Sekarang <span className="ic"><ArrowRight size={17} color={C.lime}/></span></>
                }
              </button>

              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:C.textLt, textAlign:'center', lineHeight:1.6,
              }}>
                🔒 Aman via Mayar · QRIS · Transfer Bank · E-Wallet
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}