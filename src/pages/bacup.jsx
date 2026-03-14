import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { TreePine, CheckCircle, Loader, ArrowRight, MapPin, Trophy } from 'lucide-react';

/* ── Fonts ─────────────────────────────────────────────────────── */
if (!document.getElementById('success-fonts')) {
  const l = document.createElement('link');
  l.id   = 'success-fonts';
  l.rel  = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

/* ── Tokens ─────────────────────────────────────────────────────── */
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

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse-lime {
    0%,100% { box-shadow:0 0 0 0 rgba(181,226,53,.55); }
    60%     { box-shadow:0 0 0 10px rgba(181,226,53,0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  .fu { animation:fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
  .d1 { animation-delay:.1s; }
  .d2 { animation-delay:.22s; }
  .d3 { animation-delay:.34s; }
  .d4 { animation-delay:.46s; }

  .btn-lime {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:12px 12px 12px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px;
    text-decoration:none; border:none; cursor:pointer;
    transition:background .2s, transform .2s;
  }
  .btn-lime:hover { background:${C.limeHov}; transform:translateY(-2px); }
  .btn-lime .ac {
    width:32px; height:32px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }

  .btn-outline {
    display:inline-flex; align-items:center; gap:8px;
    background:#fff; color:${C.textMd};
    padding:12px 22px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:14px;
    text-decoration:none; border:1.5px solid ${C.border};
    transition:background .2s, transform .2s;
  }
  .btn-outline:hover { background:${C.offWhite}; transform:translateY(-2px); }

  .info-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:13px 0;
    border-bottom:1px solid ${C.border};
    font-family:'DM Sans',sans-serif;
  }
  .info-row:last-child { border-bottom:none; }
`;

export default function DonationSuccessPage() {
  const [params] = useSearchParams();
  const donationId = params.get('donation_id');
  const [donation, setDonation] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [retries, setRetries]   = useState(0);

  useEffect(() => {
    if (!donationId) { setLoading(false); return; }
    const fetchDonation = async () => {
      try {
        const res = await api.get(`/donations/${donationId}?allow_public=1`);
        setDonation(res.data);
        if (res.data.status === 'pending' && retries < 5) {
          setTimeout(() => setRetries(r => r + 1), 3000);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [donationId, retries]);

  /* ── Loading ── */
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight:'70vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:16,
      }}>
        <div style={{
          width:52, height:52, borderRadius:'50%',
          border:`3px solid ${C.border}`,
          borderTopColor:C.greenMd,
          animation:'spin 1s linear infinite',
        }}/>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd }}>
          Memverifikasi pembayaran...
        </p>
        {retries > 0 && (
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textLt }}>
            Mencoba ke-{retries}/5...
          </p>
        )}
      </div>
    </>
  );

  const isPaid = donation?.status === 'paid';

  return (
    <>
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <div style={{
        background: isPaid ? C.green : '#f5f5f0',
        padding:'56px 40px 52px', textAlign:'center',
      }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          {/* Icon */}
          <div className="fu d1" style={{
            width:80, height:80, borderRadius:'50%',
            background: isPaid ? 'rgba(181,226,53,.2)' : 'rgba(0,0,0,.06)',
            border: isPaid ? `2px solid rgba(181,226,53,.4)` : `2px solid ${C.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 24px',
            animation: isPaid ? 'pulse-lime 2.5s infinite' : 'none',
          }}>
            {isPaid
              ? <CheckCircle size={38} color={C.lime}/>
              : <TreePine size={38} color={C.textLt}/>
            }
          </div>

          <h1 className="fu d2" style={{
            fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:46,
            color: isPaid ? '#fff' : C.textDk,
            letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:14,
          }}>
            {isPaid ? 'Terima Kasih! 🌿' : 'Pembayaran Sedang\nDiproses'}
          </h1>
          {isPaid && (
            <p className="fu d3" style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:'rgba(255,255,255,.5)', lineHeight:1.7,
            }}>
              Pohonmu akan segera ditanam di lahan terdeforestasi Indonesia.
              Kamu adalah pahlawan hutan sejati! 🌳
            </p>
          )}
        </div>
      </div>

      {/* ── Detail Card ── */}
      <div style={{ maxWidth:520, margin:'0 auto', padding:'36px 24px 80px' }}>

        {donation && (
          <div className="fu d3" style={{
            background:'#fff', borderRadius:22, border:`1px solid ${C.border}`,
            padding:'8px 24px 24px', marginBottom:24,
            boxShadow:'0 4px 20px rgba(0,0,0,.06)',
          }}>
            <div className="info-row">
              <span style={{ fontSize:13, color:C.textLt }}>Status Pembayaran</span>
              <span style={{
                fontSize:13, fontWeight:600,
                color: isPaid ? C.greenMd : '#b45309',
              }}>
                {isPaid ? '✅ Lunas' : '⏳ ' + donation.status}
              </span>
            </div>
            <div className="info-row">
              <span style={{ fontSize:13, color:C.textLt }}>Jumlah Donasi</span>
              <span style={{ fontSize:14, fontWeight:700, color:C.textDk }}>
                {donation.amount_formatted}
              </span>
            </div>
            <div className="info-row">
              <span style={{ fontSize:13, color:C.textLt }}>Pohon Ditanam</span>
              <span style={{
                fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:700, color:C.greenMd,
              }}>
                {donation.trees_count} 🌱
              </span>
            </div>
            {donation.donor_name && (
              <div className="info-row">
                <span style={{ fontSize:13, color:C.textLt }}>Atas Nama</span>
                <span style={{ fontSize:13, fontWeight:500, color:C.textDk }}>{donation.donor_name}</span>
              </div>
            )}
            {donation.donor_message && (
              <div style={{ paddingTop:16, marginTop:4 }}>
                <p style={{ fontSize:11, color:C.textLt, marginBottom:6, fontWeight:600, letterSpacing:'.5px', textTransform:'uppercase' }}>Pesanmu</p>
                <p style={{ fontSize:13.5, color:C.textMd, fontStyle:'italic', lineHeight:1.6 }}>
                  "{donation.donor_message}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trees planted banner */}
        {isPaid && donation && (
          <div className="fu d4" style={{
            background:C.green, borderRadius:20, padding:'24px 28px',
            marginBottom:28, position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', right:-30, top:-30,
              width:130, height:130, borderRadius:'50%',
              background:'rgba(181,226,53,.07)',
            }}/>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14,
              color:'rgba(255,255,255,.75)', lineHeight:1.65,
            }}>
              🌳 <strong style={{ color:C.lime }}>{donation.trees_count} pohon</strong> akan
              ditanam di lahan terdeforestasi Indonesia atas namamu!
            </p>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link to="/leaderboard" className="btn-lime">
            <Trophy size={16}/> Lihat Leaderboard
            <span className="ac"><ArrowRight size={14} color={C.lime}/></span>
          </Link>
          <Link to="/map" className="btn-outline">
            <MapPin size={15}/> Lihat Peta
          </Link>
        </div>
      </div>
    </>
  );
}