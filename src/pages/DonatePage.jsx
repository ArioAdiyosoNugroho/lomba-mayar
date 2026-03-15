import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Heart, Loader, ArrowRight, TreePine, CheckCircle, ChevronDown } from 'lucide-react';

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
  { trees: 1,   amount: 5000,   label: '1 Pohon',   emoji: '🌱', desc: 'Satu langkah kecil' },
  { trees: 5,   amount: 25000,  label: '5 Pohon',   emoji: '🌿', desc: 'Paling populer', popular: true },
  { trees: 10,  amount: 50000,  label: '10 Pohon',  emoji: '🌳', desc: 'Dampak nyata' },
  { trees: 20,  amount: 100000, label: '20 Pohon',  emoji: '🌲', desc: 'Pahlawan hutan' },
  { trees: 100, amount: 500000, label: '100 Pohon', emoji: '🏕️', desc: 'Kontribusi besar' },
];

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
  @keyframes shimmer {
    0%   { background-position:-200% 0; }
    100% { background-position:200% 0; }
  }

  .fu  { animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .d1  { animation-delay:.07s; }
  .d2  { animation-delay:.16s; }
  .d3  { animation-delay:.25s; }

  /* ── Package card ── */
  .pkg-card {
    display:flex; align-items:center; gap:13px;
    padding:14px 16px; border-radius:16px;
    border:2px solid ${C.border}; background:#fff;
    cursor:pointer; transition:all .18s; width:100%; text-align:left;
    position:relative; overflow:hidden;
    -webkit-tap-highlight-color:transparent;
  }
  .pkg-card:hover  { border-color:${C.greenMd}; transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
  .pkg-card:active { transform:scale(.98); }
  .pkg-card.active {
    border-color:${C.green}; background:${C.green};
    box-shadow:0 8px 24px rgba(27,58,43,.25);
  }

  /* ── Input ── */
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
  .f-input:focus {
    border-color:${C.greenMd}; background:#fff;
    box-shadow:0 0 0 4px rgba(45,106,79,.1);
  }
  .f-input::placeholder { color:${C.textLt}; }

  /* ── Pay button ── */
  .btn-pay {
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:18px 18px 18px 30px; border-radius:99px; width:100%;
    font-family:'DM Sans',sans-serif; font-weight:700; font-size:16px;
    border:none; cursor:pointer;
    transition:background .2s, transform .2s, box-shadow .2s;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-pay:hover:not(:disabled) {
    background:${C.limeHov}; transform:translateY(-2px);
    box-shadow:0 12px 36px rgba(181,226,53,.35);
  }
  .btn-pay:active:not(:disabled) { transform:scale(.98); }
  .btn-pay:disabled { opacity:.4; cursor:not-allowed; }
  .btn-pay .ic {
    width:44px; height:44px; border-radius:50%; background:${C.textDk};
    flex-shrink:0; display:flex; align-items:center; justify-content:center;
    transition:transform .2s;
  }
  .btn-pay:hover:not(:disabled) .ic { transform:translateX(4px); }

  /* ── Mobile sticky footer ── */
  .mob-footer {
    position:fixed; bottom:0; left:0; right:0; z-index:100;
    background:#fff; padding:12px 16px 20px;
    border-top:1px solid ${C.border};
    box-shadow:0 -8px 32px rgba(0,0,0,.1);
    display:none;
  }

  /* ── Trust badge row ── */
  .trust-row {
    display:flex; align-items:center; gap:6px; flex-wrap:wrap;
    justify-content:center;
  }
  .trust-chip {
    display:inline-flex; align-items:center; gap:5px;
    font-family:'DM Sans',sans-serif; font-size:11.5px;
    color:${C.textLt}; background:rgba(0,0,0,.04);
    border-radius:99px; padding:5px 10px;
  }

  /* ── Responsive ── */
  @media (max-width:768px) {
    .mob-footer     { display:block !important; }
    .desk-cta       { display:none !important; }
    .donate-grid    { grid-template-columns:1fr !important; gap:0 !important; }
    .right-col      { display:none !important; }
    .page-wrap      { padding:20px 16px 120px !important; }
    .hero-wrap      { padding:20px 20px 36px !important; min-height:auto !important; }
    .hero-title     { font-size:42px !important; letter-spacing:-1.5px !important; }
    .hero-stats     { gap:20px !important; flex-wrap:wrap !important; }
    .stat-val       { font-size:20px !important; }
    .info-grid      { grid-template-columns:1fr !important; }
    .section-card   { border-radius:18px !important; padding:20px !important; }
    .pkg-card       { padding:12px 14px !important; }
    .pkg-emoji      { font-size:20px !important; }
  }

  @media (min-width:769px) {
    .mob-only { display:none !important; }
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
  const [showInfo,  setShowInfo]  = useState(false); // mobile: toggle donor info

  const amount     = useCustom ? parseInt(custom || 0) : selected.amount;
  const treesCount = Math.floor(amount / 5000);
  const canPay     = amount >= 5000 && !loading;

  const checkout = async () => {
    if (amount < 5000) { toast.error('Minimal donasi Rp 5.000.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/donations/order', {
        amount,
        donor_name    : name    || undefined,
        donor_email   : email   || undefined,
        donor_message : message || undefined,
      });
      toast.success('Mengarahkan ke pembayaran…');
      window.location.href = res.data.checkout_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat order.');
    } finally { setLoading(false); }
  };

  /* ── Shared package list ── */
  function PackageList() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {PACKAGES.map(p => {
          const isActive = !useCustom && selected.amount === p.amount;
          return (
            <button key={p.amount}
              className={`pkg-card${isActive ? ' active' : ''}`}
              onClick={() => { setSelected(p); setUseCustom(false); }}>
              <span className="pkg-emoji" style={{ fontSize:22, flexShrink:0 }}>{p.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{
                    fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
                    color: isActive ? '#fff' : C.textDk,
                  }}>{p.label}</span>
                  {p.popular && (
                    <span style={{
                      background: isActive ? 'rgba(181,226,53,.25)' : C.lime,
                      color: isActive ? C.lime : C.textDk,
                      fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      letterSpacing:'.3px',
                    }}>POPULER</span>
                  )}
                </div>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:12,
                  color: isActive ? 'rgba(255,255,255,.5)' : C.textLt, marginTop:2,
                }}>{p.desc}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <span style={{
                  fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
                  color: isActive ? C.lime : C.greenMd, display:'block',
                }}>Rp {p.amount.toLocaleString('id')}</span>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:11,
                  color: isActive ? 'rgba(255,255,255,.4)' : C.textLt,
                }}>{p.trees} pohon</span>
              </div>
              {isActive && (
                <CheckCircle size={18} color={C.lime} style={{ flexShrink:0 }}/>
              )}
            </button>
          );
        })}

        {/* Custom */}
        <button className={`pkg-card${useCustom ? ' active' : ''}`}
          onClick={() => setUseCustom(true)}>
          <span className="pkg-emoji" style={{ fontSize:22, flexShrink:0 }}>✏️</span>
          <div style={{ flex:1 }}>
            <span style={{
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15,
              color: useCustom ? '#fff' : C.textDk,
            }}>Nominal Sendiri</span>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:12,
              color: useCustom ? 'rgba(255,255,255,.5)' : C.textLt, marginTop:2,
            }}>Kelipatan Rp 5.000</p>
          </div>
          {useCustom && <CheckCircle size={18} color={C.lime} style={{ flexShrink:0 }}/>}
        </button>

        {useCustom && (
          <div style={{ position:'relative' }}>
            <span style={{
              position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
              fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:C.textLt, fontWeight:500, pointerEvents:'none',
            }}>Rp</span>
            <input
              type="number" value={custom}
              onChange={e => setCustom(e.target.value)}
              min={5000} step={5000} placeholder="Masukkan nominal"
              className="f-input" style={{ paddingLeft:44 }}
              autoFocus
            />
          </div>
        )}
      </div>
    );
  }

  /* ── Donor info fields ── */
  function DonorFields() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div className="info-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label className="f-label">Nama</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Nama kamu" className="f-input"/>
          </div>
          <div>
            <label className="f-label">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="nama@email.com" className="f-input"/>
          </div>
        </div>
        <div>
          <label className="f-label">Pesan untuk Hutan Indonesia</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            rows={3} placeholder="Tuliskan pesanmu… (opsional)"
            className="f-input" style={{ resize:'none' }}/>
        </div>
      </div>
    );
  }

  /* ── Desktop order summary card ── */
  function SummaryCard() {
    return (
      <div style={{
        background:C.green, borderRadius:22, padding:'28px',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:-40, top:-40,
          width:160, height:160, borderRadius:'50%',
          background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>

        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.35)',
          letterSpacing:'.8px', textTransform:'uppercase', marginBottom:20 }}>
          Ringkasan Donasi
        </p>

        {/* Big tree count */}
        <div style={{ textAlign:'center', padding:'16px 0 24px',
          borderBottom:'1px solid rgba(255,255,255,.1)', marginBottom:20 }}>
          {treesCount > 0 ? (
            <>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:76, fontWeight:800,
                color:C.lime, lineHeight:1 }}>{treesCount.toLocaleString('id')}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14,
                color:'rgba(255,255,255,.55)', marginTop:6 }}>Pohon akan ditanam</p>
            </>
          ) : (
            <div style={{ padding:'8px 0' }}>
              <TreePine size={44} color="rgba(255,255,255,.1)"
                style={{ margin:'0 auto 8px', display:'block' }}/>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                color:'rgba(255,255,255,.2)' }}>Pilih paket dulu</p>
            </div>
          )}
        </div>

        {/* Summary rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:20 }}>
          {[
            { l:'Paket',      v: useCustom ? 'Nominal Sendiri' : selected.label },
            { l:'Total',      v: amount > 0 ? `Rp ${amount.toLocaleString('id')}` : '—', big:true },
          ].map(({ l, v, big }) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                color:'rgba(255,255,255,.4)' }}>{l}</span>
              <span style={{
                fontFamily: big ? "'Syne',sans-serif" : "'DM Sans',sans-serif",
                fontSize: big ? 18 : 13.5, fontWeight: big ? 800 : 600,
                color: big ? '#fff' : 'rgba(255,255,255,.75)',
              }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,.1)', paddingTop:16 }}>
          {['🛰️ Dipantau via satelit','📊 Transparan & terverifikasi','🌿 Pohon nyata ditanam'].map(t => (
            <p key={t} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
              color:'rgba(255,255,255,.35)', marginBottom:7 }}>{t}</p>
          ))}
        </div>
      </div>
    );
  }

  /* ═══════════════════════ RENDER ═══════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.green }} className="hero-wrap">
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&auto=format&fit=crop&q=80"
          alt=""
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', objectPosition:'center 40%', display:'block' }}
        />
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(105deg,rgba(27,58,43,.97) 0%,rgba(27,58,43,.88) 40%,rgba(27,58,43,.5) 100%)' }}/>

        <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ height:80 }}/>
          <div className="fu d1 hero-wrap" style={{ padding:'16px 60px 52px' }}>

            <h1 className="fu d1 hero-title" style={{
              fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:60,
              lineHeight:.96, letterSpacing:'-2.5px', color:'#fff', marginBottom:24,
            }}>
              Tanam Pohon,<br/>
              <span style={{ color:C.lime }}>Sekarang</span>
            </h1>

            <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
              {[
                { v:'87.500+', l:'Pohon Ditanam' },
                { v:'3.200+',  l:'Donatur Aktif' },
                { v:'34',      l:'Provinsi' },
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

      {/* ── MAIN CONTENT ── */}
      <div style={{ background:C.offWhite }}>
        <div className="page-wrap" style={{ maxWidth:1100, margin:'0 auto', padding:'32px 60px 80px' }}>
          <div className="donate-grid" style={{
            display:'grid', gridTemplateColumns:'1fr 370px', gap:28, alignItems:'start',
          }}>

            {/* ── LEFT column ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

              {/* Package picker */}
              <div className="fu d1 section-card" style={{
                background:'#fff', borderRadius:22, border:`1px solid ${C.border}`, padding:'26px',
              }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:4 }}>Pilih Jumlah Pohon</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt,
                  marginBottom:18 }}>Rp 5.000 = 1 pohon nyata di lahan terdeforestasi</p>
                <PackageList/>
              </div>

              {/* Donor info — desktop always visible */}
              <div className="fu d2 section-card desk-cta" style={{
                background:'#fff', borderRadius:22, border:`1px solid ${C.border}`, padding:'26px',
              }}>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:4 }}>Informasi Donatur</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt,
                  marginBottom:18 }}>Opsional — untuk bukti donasi & nama di leaderboard</p>
                <DonorFields/>
              </div>

              {/* Donor info — mobile collapsible */}
              <div className="mob-only section-card" style={{
                background:'#fff', borderRadius:18, border:`1px solid ${C.border}`, overflow:'hidden',
              }}>
                <button
                  onClick={() => setShowInfo(s => !s)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'16px 20px', background:'none', border:'none', cursor:'pointer',
                    '-webkit-tap-highlight-color':'transparent',
                  }}>
                  <div>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                      color:C.textDk, textAlign:'left' }}>Informasi Donatur</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt,
                      marginTop:2, textAlign:'left' }}>Opsional — nama & email</p>
                  </div>
                  <ChevronDown size={18} color={C.textLt}
                    style={{ transition:'transform .25s', transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink:0 }}/>
                </button>
                {showInfo && (
                  <div style={{ padding:'0 20px 20px', borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
                    <DonorFields/>
                  </div>
                )}
              </div>

              {/* Trust row — mobile */}
              <div className="mob-only trust-row" style={{ paddingBottom:4 }}>
                {['🔒 Aman','🛰️ Dipantau satelit','📊 Transparan'].map(t => (
                  <span key={t} className="trust-chip">{t}</span>
                ))}
              </div>

            </div>

            {/* ── RIGHT column (desktop only) ── */}
            <div className="right-col" style={{ position:'sticky', top:96,
              display:'flex', flexDirection:'column', gap:16 }}>

              <SummaryCard/>

              <button className="btn-pay fu d2" onClick={checkout}
                disabled={!canPay}>
                {loading
                  ? <><Loader size={18} style={{ animation:'spin 1s linear infinite' }}/> Memproses…</>
                  : <><Heart size={17}/> Donasi Sekarang <span className="ic"><ArrowRight size={17} color={C.lime}/></span></>
                }
              </button>

              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt,
                textAlign:'center', lineHeight:1.6 }}>
                🔒 Aman via Mayar · QRIS · Transfer · E-Wallet
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE STICKY FOOTER — checkout bar fixed at bottom
      ═══════════════════════════════════════════════════════════ */}
      <div className="mob-footer">
        {/* Mini summary */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:10, padding:'0 2px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {treesCount > 0 ? (
              <>
                <div style={{
                  width:38, height:38, borderRadius:10, background:C.green,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <TreePine size={18} color={C.lime}/>
                </div>
                <div>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                    color:C.textDk, lineHeight:1 }}>
                    {treesCount} Pohon
                  </p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                    color:C.textLt, marginTop:2 }}>
                    {useCustom ? 'Nominal Sendiri' : selected.label}
                  </p>
                </div>
              </>
            ) : (
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>
                Pilih paket pohon dulu
              </p>
            )}
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800,
              color:C.textDk, lineHeight:1 }}>
              {amount > 0 ? `Rp ${amount.toLocaleString('id')}` : '—'}
            </p>
            {treesCount > 0 && (
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                color:C.textLt, marginTop:2 }}>
                Rp 5.000/pohon
              </p>
            )}
          </div>
        </div>

        {/* Pay button */}
        <button className="btn-pay" onClick={checkout} disabled={!canPay}
          style={{ fontSize:15.5, padding:'15px 15px 15px 26px' }}>
          {loading
            ? <><Loader size={17} style={{ animation:'spin 1s linear infinite' }}/> Memproses…</>
            : <><Heart size={17}/> Bayar Sekarang <span className="ic" style={{ width:40, height:40 }}>
                <ArrowRight size={16} color={C.lime}/>
              </span></>
          }
        </button>
      </div>
    </>
  );
}