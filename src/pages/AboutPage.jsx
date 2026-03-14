import { Link } from 'react-router-dom';
import {
  TreePine, ArrowRight, ArrowUpRight, Heart, Users,
  MapPin, Shield, Eye, Zap, Globe, Mail, Github,
} from 'lucide-react';

/* ── Fonts ─────────────────────────────────────────────────────── */
if (!document.getElementById('about-fonts')) {
  const l = document.createElement('link');
  l.id = 'about-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
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

/* ── Photos ─────────────────────────────────────────────────────── */
const IMG = {
  forest : 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
  team1  : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
  team2  : 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
};

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { font-family:'DM Sans',sans-serif; background:${C.offWhite}; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(22px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fu  { animation:fadeUp .75s cubic-bezier(.16,1,.3,1) both; }
  .d0  { animation-delay:.04s; }
  .d1  { animation-delay:.14s; }
  .d2  { animation-delay:.26s; }
  .d3  { animation-delay:.38s; }
  .d4  { animation-delay:.50s; }

  /* Buttons */
  .btn-lime {
    display:inline-flex; align-items:center; gap:10px;
    background:${C.lime}; color:${C.textDk};
    padding:11px 11px 11px 24px; border-radius:99px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14.5px;
    text-decoration:none; border:none; cursor:pointer; white-space:nowrap;
    transition:background .2s, transform .2s, box-shadow .2s;
  }
  .btn-lime:hover { background:${C.limeHov}; transform:translateY(-2px); box-shadow:0 10px 28px rgba(181,226,53,.3); }
  .btn-lime .ac {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
  }
  .btn-lime .ac {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:${C.textDk}; display:flex; align-items:center; justify-content:center;
    color:${C.lime};  /* ← tambahkan ini */
  }

  /* Value card */
  .val-card {
    background:#fff; border-radius:22px; border:1px solid ${C.border};
    padding:28px 28px; transition:transform .26s, box-shadow .26s;
  }
  .val-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.08); }

  /* Team card */
  .team-card {
    background:#fff; border-radius:22px; border:1px solid ${C.border};
    overflow:hidden; transition:transform .26s, box-shadow .26s;
  }
  .team-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.09); }

  /* Pill tag */
  .pill-tag {
    display:inline-flex; align-items:center; gap:7px;
    border:1px solid ${C.border}; border-radius:99px;
    padding:5px 15px;
    font-family:'DM Sans',sans-serif; font-size:12.5px; color:${C.textMd};
  }

  /* Stat item */
  .stat-item {
    display:flex; flex-direction:column; align-items:center;
    padding:28px 24px; border-right:1px solid rgba(255,255,255,.08);
  }
  .stat-item:last-child { border-right:none; }

  /* Responsive */
  @media (max-width:1024px) {
    .hero-cols { flex-direction:column !important; align-items:flex-start !important; }
    .hero-h1   { font-size:58px !important; }
    .mission-grid { grid-template-columns:1fr !important; }
    .team-grid    { grid-template-columns:repeat(2,1fr) !important; }
    .val-grid     { grid-template-columns:repeat(2,1fr) !important; }
  }
  @media (max-width:640px) {
    .hero-h1   { font-size:40px !important; }
    .sp        { padding-left:20px !important; padding-right:20px !important; }
    .stats-row { grid-template-columns:1fr 1fr !important; }
    .val-grid  { grid-template-columns:1fr !important; }
    .team-grid { grid-template-columns:1fr !important; }
    .stat-item { border-right:none !important; border-bottom:1px solid rgba(255,255,255,.08); }
    .stat-item:last-child { border-bottom:none; }
    .cta-row   { flex-direction:column !important; align-items:flex-start !important; }
  }
`;

/* ── Data ────────────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: Eye,
    color: '#0ea5e9',
    title: 'Transparan',
    desc: 'Setiap laporan, setiap donasi, dan setiap pohon yang ditanam dapat dilacak secara publik. Tidak ada yang disembunyikan.',
  },
  {
    icon: Shield,
    color: C.greenMd,
    title: 'Terverifikasi',
    desc: 'Tim kami memverifikasi setiap laporan sebelum dipublikasikan. Data yang akurat lebih berharga dari data yang banyak.',
  },
  {
    icon: Users,
    color: '#f59e0b',
    title: 'Berbasis Komunitas',
    desc: 'Kekuatan kami adalah masyarakat. Siapa pun bisa melapor, memverifikasi, dan berkontribusi dalam pemulihan hutan.',
  },
  {
    icon: Zap,
    color: '#8b5cf6',
    title: 'Aksi Nyata',
    desc: 'Kami tidak berhenti di data. Setiap laporan kritis diteruskan ke pihak berwenang dan organisasi lingkungan terkait.',
  },
  {
    icon: Globe,
    color: '#ef4444',
    title: 'Berbasis Data',
    desc: 'Keputusan kami didorong data satelit, laporan lapangan, dan analisis geospasial — bukan asumsi.',
  },
  {
    icon: Heart,
    color: '#e11d48',
    title: 'Dampak Jangka Panjang',
    desc: 'Setiap pohon dipantau pertumbuhannya. Kami memastikan kontribusimu benar-benar mengubah kondisi hutan.',
  },
];

const TEAM = [
  { 
    name:'Raka Pratama',   
    role:'Founder & CEO',         
    photo:'https://randomuser.me/api/portraits/men/32.jpg',
  },
  { 
    name:'Sari Dewi',      
    role:'Lead Developer',         
    photo:'https://randomuser.me/api/portraits/women/44.jpg',
  },
  { 
    name:'Bagas Nugroho',  
    role:'Data & GIS Analyst',     
    photo:'https://randomuser.me/api/portraits/men/67.jpg',
  },
  { 
    name:'Layla Kusuma',   
    role:'Community Manager',      
    photo:'https://randomuser.me/api/portraits/women/28.jpg',
  },
  { 
    name:'Dimas Arya',     
    role:'Partnerships & Outreach',
    photo:'https://randomuser.me/api/portraits/men/15.jpg',
  },
  { 
    name:'Nia Rahma',      
    role:'Content & Research',     
    photo:'https://randomuser.me/api/portraits/women/56.jpg',
  },
];

const TIMELINE = [
  { year:'2021', title:'Ide Awal', desc:'HutanKita lahir dari keprihatinan atas laju deforestasi di Kalimantan yang tidak terpantau publik.' },
  { year:'2022', title:'Peluncuran Beta', desc:'Platform pertama kali diluncurkan dengan 12 laporan dari komunitas lokal di Kalimantan Tengah.' },
  { year:'2023', title:'Program Tanam Pohon', desc:'Program donasi pohon dimulai. Dalam 6 bulan, 15.000 pohon berhasil ditanam di 3 provinsi.' },
  { year:'2024', title:'Ekspansi Nasional', desc:'HutanKita hadir di seluruh Indonesia dengan jaringan 3.200+ relawan aktif dan 12.400+ laporan terverifikasi.' },
];

/* ══════════════════ PAGE ════════════════════════════════════════ */
export default function AboutPage() {
  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO — dark green (same as HomePage) ══════════════════ */}
      <div style={{ background:C.green, position:'relative' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ height:80 }}/>

          {/* Hero text row */}
          <div className="hero-cols d1 fu sp" style={{
            display:'flex', alignItems:'flex-end', justifyContent:'space-between',
            gap:32, padding:'16px 60px 0', flexWrap:'wrap',
          }}>
            <div>
              <h1 className="hero-h1" style={{
                fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:76, lineHeight:.96, letterSpacing:'-3px', color:'#fff',
              }}>
                Digerakkan Data,<br/>
                <span style={{ color:C.lime }}>Dipandu Komunitas</span>
              </h1>
            </div>
            <div className="fu d2" style={{ maxWidth:300, paddingBottom:8 }}>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.8,
                color:'rgba(255,255,255,.48)',
              }}>
                HutanKita adalah platform pemantauan dan pemulihan hutan Indonesia
                yang dibangun bersama masyarakat, untuk masyarakat.
              </p>
            </div>
          </div>

          {/* Hero image */}
          <div className="fu d3 sp" style={{ margin:'32px 20px 0' }}>
            <div style={{
              height:400, borderRadius:'18px 18px 0 0',
              overflow:'hidden', position:'relative', background:C.greenMd,
            }}>
              <img
                src={IMG.forest} alt="Hutan Indonesia"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
              />
              {/* Gradient */}
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(to top, rgba(5,16,9,.7) 0%, rgba(5,16,9,.1) 40%, transparent 65%)',
              }}/>
              {/* Stats bar inside image */}
              <div style={{
                position:'absolute', bottom:0, left:0, right:0,
                display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                borderTop:'1px solid rgba(255,255,255,.1)',
              }}>
                {[
                  { v:'12.400+', l:'Laporan Aktif' },
                  { v:'87.500',  l:'Pohon Ditanam' },
                  { v:'3.200+',  l:'Relawan' },
                  { v:'34',      l:'Provinsi Terjangkau' },
                ].map(({ v, l }) => (
                  <div key={l} className="stat-item">
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'#fff', lineHeight:1 }}>{v}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'rgba(255,255,255,.45)', marginTop:6 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MISI — white ════════════════════════════════════════════ */}
      <section style={{ background:'#fff', padding:'88px 60px' }} className="sp">
        <div className="mission-grid" style={{
          maxWidth:1200, margin:'0 auto',
          display:'grid', gridTemplateColumns:'1fr 1fr',
          gap:64, alignItems:'center',
        }}>
          {/* Left photo */}
          <div style={{ position:'relative' }}>
            <div style={{
              borderRadius:24, overflow:'hidden', height:400, background:'#c8d5c8',
            }}>
              <img src={IMG.team1} alt="Tim HutanKita"
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              <div style={{
                position:'absolute', inset:0,
                background:'linear-gradient(to top, rgba(10,26,14,.65) 0%, transparent 55%)',
              }}/>
              {/* Tags */}
              <div style={{ position:'absolute', bottom:16, left:16, display:'flex', flexWrap:'wrap', gap:8 }}>
                {['Transparan','Aksi Nyata','Berbasis Data','Komunitas'].map(t => (
                  <span key={t} style={{
                    background:'rgba(181,226,53,.92)', color:C.textDk,
                    borderRadius:99, padding:'4px 13px',
                    fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600,
                  }}>{t}</span>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div style={{
              position:'absolute', top:-18, right:-18,
              background:C.lime, borderRadius:18, padding:'16px 20px',
              boxShadow:'0 8px 28px rgba(181,226,53,.35)',
            }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:C.textDk, lineHeight:1 }}>2021</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.textMd, marginTop:3 }}>Didirikan</p>
            </div>
          </div>

          {/* Right text */}
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <span className="pill-tag" style={{ alignSelf:'flex-start' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
              Misi Kami
            </span>
            <h2 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:40,
              lineHeight:1.1, letterSpacing:'-.5px', color:C.textDk,
            }}>
              Hutan Indonesia<br/>Adalah Warisan<br/>Kita Bersama
            </h2>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.85,
              color:C.textMd,
            }}>
              HutanKita hadir karena kami percaya bahwa setiap warga negara berhak
              tahu kondisi hutannya — dan punya kekuatan untuk menjaganya.
            </p>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:15, lineHeight:1.85,
              color:C.textMd,
            }}>
              Kami menghubungkan masyarakat, aktivis, jurnalis, dan pengambil kebijakan
              dalam satu ekosistem data yang terbuka, terverifikasi, dan dapat ditindaklanjuti.
              Setiap laporan bukan sekadar catatan — ia adalah panggilan untuk bertindak.
            </p>
            <div style={{ display:'flex', gap:16, alignItems:'center', paddingTop:8 }}>
              <Link to="/donate" className="btn-lime">
                Ikut Berkontribusi
                <span className="ac"><ArrowRight size={15}/></span>
              </Link>
              <Link to="/map" style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd,
                textDecoration:'none', fontWeight:500,
                display:'flex', alignItems:'center', gap:5,
                borderBottom:`1.5px solid ${C.textLt}`, paddingBottom:2,
              }}>
                Lihat Peta <ArrowUpRight size={14}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TIMELINE — offWhite ══════════════════════════════════════ */}
{/* ══ TIMELINE — offWhite ══════════════════════════════════════════ */}
<section style={{ background:C.offWhite, padding:'80px 60px', borderTop:`1px solid ${C.border}` }} className="sp">
  <div style={{ maxWidth:1200, margin:'0 auto' }}>
    <div style={{ textAlign:'center', marginBottom:56 }}>
      <span className="pill-tag" style={{ marginBottom:16, display:'inline-flex' }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
        Perjalanan Kami
      </span>
      <h2 style={{
        fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:38,
        color:C.textDk, letterSpacing:'-.5px',
      }}>Dari Ide ke Dampak Nyata</h2>
    </div>

    {/* Timeline wrapper — semua relatif terhadap container ini */}
    <div style={{ position:'relative', maxWidth:680, margin:'0 auto' }}>

      {/* Vertical line — di-center tepat di tengah dot column */}
      {/* dot ada di left:96px (lebar year col) + 7px (setengah dot 14px) = 103px */}
      <div style={{
        position:'absolute',
        left:103,
        top:7,        /* mulai dari center dot pertama */
        bottom:7,     /* berakhir di center dot terakhir */
        width:2,
        background:`linear-gradient(to bottom, ${C.lime} 0%, ${C.lime}40 100%)`,
        borderRadius:2,
      }}/>

      <div style={{ display:'flex', flexDirection:'column', gap:44 }}>
        {TIMELINE.map((item, i) => (
          <div key={item.year} style={{
            display:'flex',
            alignItems:'flex-start',
            gap:0,
          }}>

            {/* Kolom tahun — lebar fixed, right-aligned */}
            <div style={{
              width:96,
              flexShrink:0,
              paddingTop:0,
              display:'flex',
              justifyContent:'flex-end',
              paddingRight:20,
            }}>
              <span style={{
                fontFamily:"'Syne',sans-serif",
                fontSize:13,
                fontWeight:800,
                color:C.greenMd,
                lineHeight:'14px',  /* sama tinggi dengan dot */
              }}>{item.year}</span>
            </div>

            {/* Dot — center tepat di baris year */}
            <div style={{
              width:14,
              height:14,
              borderRadius:'50%',
              zIndex: 10,
              flexShrink:0,
              background: i === TIMELINE.length - 1 ? C.lime : '#fff',
              border:`2px solid ${C.lime}`,
              boxShadow: i === TIMELINE.length - 1
                ? `0 0 0 5px ${C.lime}30`
                : 'none',
              /* tidak perlu marginTop karena year text dan dot sama tingginya (14px) */
            }}/>

            {/* Content */}
            <div style={{ paddingLeft:20, flex:1, paddingTop:0 }}>
              <p style={{
                fontFamily:"'Syne',sans-serif",
                fontSize:16,
                fontWeight:700,
                color:C.textDk,
                marginBottom:7,
                lineHeight:'14px',  /* rata dengan dot & year */
              }}>{item.title}</p>
              <p style={{
                fontFamily:"'DM Sans',sans-serif",
                fontSize:14,
                color:C.textMd,
                lineHeight:1.75,
                marginTop:8,
              }}>{item.desc}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* ══ VALUES — white ══════════════════════════════════════════ */}
      <section style={{ background:'#fff', padding:'80px 60px' }} className="sp">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:52, flexWrap:'wrap', gap:20 }}>
            <div>
              <span className="pill-tag" style={{ marginBottom:14, display:'inline-flex' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
                Nilai-Nilai Kami
              </span>
              <h2 style={{
                fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:38,
                color:C.textDk, letterSpacing:'-.5px',
              }}>Apa yang Kami Pegang</h2>
            </div>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt,
              maxWidth:320, lineHeight:1.75,
            }}>
              Prinsip-prinsip ini bukan sekadar tulisan di dinding — ia tertanam
              dalam setiap fitur yang kami bangun.
            </p>
          </div>

          <div className="val-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {VALUES.map(({ icon:Icon, color, title, desc }) => (
              <div key={title} className="val-card">
                <div style={{
                  width:44, height:44, borderRadius:13,
                  background:color+'18',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  marginBottom:18,
                }}>
                  <Icon size={21} color={color}/>
                </div>
                <p style={{
                  fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700,
                  color:C.textDk, marginBottom:10,
                }}>{title}</p>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd,
                  lineHeight:1.8,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM — offWhite ══════════════════════════════════════════ */}
      <section style={{ background:C.offWhite, padding:'80px 60px', borderTop:`1px solid ${C.border}` }} className="sp">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <span className="pill-tag" style={{ marginBottom:16, display:'inline-flex' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
              Tim Kami
            </span>
            <h2 style={{
              fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:38,
              color:C.textDk, letterSpacing:'-.5px', marginBottom:14,
            }}>Orang-orang di Balik HutanKita</h2>
            <p style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:15, color:C.textLt,
              maxWidth:500, margin:'0 auto', lineHeight:1.75,
            }}>
              Kami adalah tim kecil yang bersemangat besar tentang masa depan hutan Indonesia.
            </p>
          </div>

          <div className="team-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {TEAM.map(({ name, role, photo }) => (
              <div key={name} className="team-card">
                {/* Photo area */}
                <div style={{
                  height:200,
                  position:'relative', overflow:'hidden',
                  borderBottom:`1px solid ${C.border}`,
                }}>
                  <img
                    src={photo}
                    alt={name}
                    style={{
                      width:'100%', height:'100%',
                      objectFit:'cover', objectPosition:'center top',
                      display:'block',
                      transition:'transform .5s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {/* Subtle gradient at bottom */}
                  <div style={{
                    position:'absolute', inset:0,
                    background:'linear-gradient(to top, rgba(0,0,0,.18) 0%, transparent 50%)',
                    pointerEvents:'none',
                  }}/>
                </div>
                {/* Info */}
                <div style={{ padding:'20px 22px' }}>
                  <p style={{
                    fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                    color:C.textDk, marginBottom:5,
                  }}>{name}</p>
                  <p style={{
                    fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt,
                  }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Join team hint */}
          <div style={{
            marginTop:28, background:'#fff', borderRadius:20, border:`1px solid ${C.border}`,
            padding:'24px 32px', display:'flex', alignItems:'center', justifyContent:'space-between',
            gap:24, flexWrap:'wrap',
          }}>
            <div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:C.textDk, marginBottom:6 }}>
                Bergabung dengan Tim Kami
              </p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt }}>
                Kami selalu mencari developer, desainer, dan aktivis lingkungan yang ingin berkontribusi.
              </p>
            </div>
            <a href="mailto:halo@hutankita.id" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.greenMd,
              fontWeight:600, textDecoration:'none',
              borderBottom:`1.5px solid ${C.greenMd}`, paddingBottom:2,
              flexShrink:0,
            }}>
              <Mail size={15}/> Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* ══ CTA — white → green card (same as HomePage CTASection) ══ */}
      <section style={{ background:'#fff', padding:'64px 60px 88px' }} className="sp">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{
            background:C.green, borderRadius:28, padding:'64px 64px',
            position:'relative', overflow:'hidden',
          }}>
            {/* Decorative */}
            <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', right:50, bottom:-80, width:200, height:200, borderRadius:'50%', background:'rgba(181,226,53,.05)', pointerEvents:'none' }}/>

            <div className="cta-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:40, position:'relative', flexWrap:'wrap' }}>
              <div style={{ maxWidth:560 }}>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.lime,
                  fontWeight:600, letterSpacing:'2px', textTransform:'uppercase',
                  display:'block', marginBottom:16,
                }}>Mulai Sekarang</span>
                <h2 style={{
                  fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:44,
                  color:'#fff', lineHeight:1.1, letterSpacing:'-.5px', marginBottom:18,
                }}>
                  Jadilah Bagian dari<br/>
                  <span style={{ color:C.lime }}>Gerakan Ini</span>
                </h2>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:15,
                  color:'rgba(255,255,255,.45)', lineHeight:1.8,
                }}>
                  Laporkan deforestasi, donasikan pohon, atau sebarkan informasi.
                  Setiap kontribusi kecil memberi dampak nyata bagi hutan Indonesia.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>
                <Link to="/report" className="btn-lime" style={{ fontSize:15, padding:'13px 13px 13px 26px' }}>
                  Buat Laporan
                  <span className="ac" style={{ width:36, height:36 }}><ArrowRight size={15}/></span>
                </Link>
                <Link to="/donate" style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
                  fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,.55)',
                  textDecoration:'none', fontWeight:500, padding:'10px 0',
                  transition:'color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.9)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.55)'}
                >
                  Donasi Pohon <ArrowUpRight size={14}/>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
