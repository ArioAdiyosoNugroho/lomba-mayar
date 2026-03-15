import { Link } from 'react-router-dom';
import {
  TreePine, ArrowRight, ArrowUpRight, Heart, Users,
  MapPin, Shield, Eye, Zap, Globe, Mail,
} from 'lucide-react';

if (!document.getElementById('about-fonts')) {
  const l = document.createElement('link');
  l.id = 'about-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
  document.head.appendChild(l);
}

const C = {
  green:'#1b3a2b', greenMd:'#2d6a4f', lime:'#b5e235', limeHov:'#c8f24d',
  offWhite:'#f5f5f0', textDk:'#0f1a10', textMd:'#4a5544', textLt:'#8a9984',
  border:'rgba(0,0,0,.08)',
};

const IMG = {
  forest:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&auto=format&fit=crop&q=80',
  team1 :'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
};

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'DM Sans',sans-serif;background:${C.offWhite}}

  @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  .fu{animation:fadeUp .75s cubic-bezier(.16,1,.3,1) both}
  .d0{animation-delay:.04s}.d1{animation-delay:.14s}.d2{animation-delay:.26s}.d3{animation-delay:.38s}

  .btn-lime{display:inline-flex;align-items:center;gap:10px;background:${C.lime};color:${C.textDk};padding:11px 11px 11px 24px;border-radius:99px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14.5px;text-decoration:none;border:none;cursor:pointer;white-space:nowrap;transition:background .2s,transform .2s,box-shadow .2s}
  .btn-lime:hover{background:${C.limeHov};transform:translateY(-2px);box-shadow:0 10px 28px rgba(181,226,53,.3)}
  .btn-lime .ac{width:34px;height:34px;border-radius:50%;flex-shrink:0;background:${C.textDk};display:flex;align-items:center;justify-content:center;color:${C.lime}}

  .val-card{background:#fff;border-radius:20px;border:1px solid ${C.border};padding:24px;transition:transform .26s,box-shadow .26s}
  .val-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08)}

  .team-card{background:#fff;border-radius:20px;border:1px solid ${C.border};overflow:hidden;transition:transform .26s,box-shadow .26s}
  .team-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.09)}

  .pill-tag{display:inline-flex;align-items:center;gap:7px;border:1px solid ${C.border};border-radius:99px;padding:5px 15px;font-family:'DM Sans',sans-serif;font-size:12.5px;color:${C.textMd}}

  .stat-item{display:flex;flex-direction:column;align-items:center;padding:20px 16px;border-right:1px solid rgba(255,255,255,.1)}
  .stat-item:last-child{border-right:none}

  /* ── RESPONSIVE ── */
  @media(max-width:768px){
    /* Hero */
    .hero-h1{font-size:38px!important;letter-spacing:-1.5px!important;line-height:1.05!important}
    .hero-pad{padding:16px 20px 0!important}
    .hero-img-wrap{margin:20px 12px 0!important}
    .hero-img-h{height:260px!important;border-radius:14px 14px 0 0!important}
    /* Stats bar di hero */
    .stats-bar{grid-template-columns:1fr 1fr!important}
    .stat-item{border-right:none!important;border-bottom:1px solid rgba(255,255,255,.1)!important}
    .stat-item:nth-child(2n){border-right:none!important}
    .stat-item:nth-last-child(-n+2){border-bottom:none!important}

    /* Section padding */
    .sec-pad{padding:52px 20px!important}

    /* Mission grid */
    .mission-grid{grid-template-columns:1fr!important;gap:32px!important}
    .mission-photo{height:240px!important}
    .floating-badge{top:-12px!important;right:-4px!important}

    /* Timeline */
    .timeline-line{left:19px!important}
    .year-col{width:0!important;paddingRight:0!important;display:none!important}
    .tl-row{gap:0!important}
    .tl-dot{margin-left:12px!important;margin-right:12px!important}

    /* Values */
    .val-grid{grid-template-columns:1fr!important}

    /* Team */
    .team-grid{grid-template-columns:1fr 1fr!important}
    .team-photo{height:150px!important}

    /* CTA */
    .cta-inner{padding:32px 20px!important;border-radius:20px!important}
    .cta-h2{font-size:32px!important}
    .cta-row{flex-direction:column!important;align-items:flex-start!important}
    .cta-section{padding:32px 20px 64px!important}
  }

  @media(max-width:400px){
    .team-grid{grid-template-columns:1fr!important}
  }
`;

const VALUES = [
  { icon:Eye,    color:'#0ea5e9', title:'Transparan',         desc:'Setiap laporan, donasi, dan pohon yang ditanam dapat dilacak secara publik.' },
  { icon:Shield, color:C.greenMd,title:'Terverifikasi',       desc:'Tim kami memverifikasi setiap laporan. Data akurat lebih berharga dari data banyak.' },
  { icon:Users,  color:'#f59e0b', title:'Berbasis Komunitas', desc:'Kekuatan kami adalah masyarakat. Siapa pun bisa melapor dan berkontribusi.' },
  { icon:Zap,    color:'#8b5cf6', title:'Aksi Nyata',         desc:'Setiap laporan kritis diteruskan ke pihak berwenang dan organisasi terkait.' },
  { icon:Globe,  color:'#ef4444', title:'Berbasis Data',      desc:'Keputusan kami didorong data satelit, laporan lapangan, dan analisis geospasial.' },
  { icon:Heart,  color:'#e11d48', title:'Dampak Jangka Panjang', desc:'Setiap pohon dipantau pertumbuhannya untuk memastikan kontribusi nyata.' },
];

const TEAM = [
  { name:'Raka Pratama',  role:'Founder & CEO',          photo:'https://randomuser.me/api/portraits/men/32.jpg' },
  { name:'Sari Dewi',     role:'Lead Developer',         photo:'https://randomuser.me/api/portraits/women/44.jpg' },
  { name:'Bagas Nugroho', role:'Data & GIS Analyst',     photo:'https://randomuser.me/api/portraits/men/67.jpg' },
  { name:'Layla Kusuma',  role:'Community Manager',      photo:'https://randomuser.me/api/portraits/women/28.jpg' },
  { name:'Dimas Arya',    role:'Partnerships & Outreach',photo:'https://randomuser.me/api/portraits/men/15.jpg' },
  { name:'Nia Rahma',     role:'Content & Research',     photo:'https://randomuser.me/api/portraits/women/56.jpg' },
];

const TIMELINE = [
  { year:'2021', title:'Ide Awal',          desc:'HutanKita lahir dari keprihatinan atas laju deforestasi di Kalimantan yang tidak terpantau publik.' },
  { year:'2022', title:'Peluncuran Beta',   desc:'Platform pertama kali diluncurkan dengan 12 laporan dari komunitas lokal di Kalimantan Tengah.' },
  { year:'2023', title:'Program Tanam Pohon', desc:'Donasi pohon dimulai. Dalam 6 bulan, 15.000 pohon berhasil ditanam di 3 provinsi.' },
  { year:'2024', title:'Ekspansi Nasional', desc:'HutanKita hadir di seluruh Indonesia dengan 3.200+ relawan aktif dan 12.400+ laporan terverifikasi.' },
];

export default function AboutPage() {
  return (
    <>
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <div style={{ background:C.green, position:'relative' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ height:80 }}/>

          <div className="hero-pad d1 fu" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, padding:'16px 60px 0', flexWrap:'wrap' }}>
            <h1 className="hero-h1" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:72, lineHeight:.97, letterSpacing:'-3px', color:'#fff', flex:'1 1 auto', minWidth:0 }}>
              Digerakkan Data,<br/><span style={{ color:C.lime }}>Dipandu Komunitas</span>
            </h1>
            <p className="fu d2" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,.45)', maxWidth:280, paddingBottom:6, flexShrink:0 }}>
              Platform pemantauan dan pemulihan hutan Indonesia yang dibangun bersama masyarakat.
            </p>
          </div>

          <div className="hero-img-wrap fu d3" style={{ margin:'28px 20px 0' }}>
            <div className="hero-img-h" style={{ height:380, borderRadius:'18px 18px 0 0', overflow:'hidden', position:'relative', background:C.greenMd }}>
              <img src={IMG.forest} alt="Hutan Indonesia" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,16,9,.75) 0%,rgba(5,16,9,.1) 45%,transparent 65%)' }}/>
              {/* Stats bar */}
              <div className="stats-bar" style={{ position:'absolute', bottom:0, left:0, right:0, display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid rgba(255,255,255,.1)' }}>
                {[
                  { v:'12.400+', l:'Laporan' },
                  { v:'87.500',  l:'Pohon Ditanam' },
                  { v:'3.200+',  l:'Relawan' },
                  { v:'34',      l:'Provinsi' },
                ].map(({ v, l }) => (
                  <div key={l} className="stat-item">
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#fff', lineHeight:1 }}>{v}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'rgba(255,255,255,.42)', marginTop:5 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MISI ══ */}
      <section className="sec-pad" style={{ background:'#fff', padding:'80px 60px' }}>
        <div className="mission-grid" style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' }}>
          {/* Foto */}
          <div style={{ position:'relative' }}>
            <div style={{ borderRadius:22, overflow:'hidden', position:'relative', background:'#c8d5c8' }}>
              <img src={IMG.team1} alt="Tim HutanKita" className="mission-photo" style={{ width:'100%', height:380, objectFit:'cover', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,26,14,.65) 0%,transparent 55%)' }}/>
              <div style={{ position:'absolute', bottom:14, left:14, display:'flex', flexWrap:'wrap', gap:7 }}>
                {['Transparan','Aksi Nyata','Berbasis Data','Komunitas'].map(t => (
                  <span key={t} style={{ background:'rgba(181,226,53,.92)', color:C.textDk, borderRadius:99, padding:'4px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="floating-badge" style={{ position:'absolute', top:-16, right:-16, background:C.lime, borderRadius:16, padding:'14px 18px', boxShadow:'0 8px 28px rgba(181,226,53,.35)' }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:C.textDk, lineHeight:1 }}>2021</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textMd, marginTop:3 }}>Didirikan</p>
            </div>
          </div>

          {/* Teks */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <span className="pill-tag" style={{ alignSelf:'flex-start' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
              Misi Kami
            </span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:36, lineHeight:1.1, letterSpacing:'-.5px', color:C.textDk }}>
              Hutan Indonesia<br/>Adalah Warisan<br/>Kita Bersama
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, lineHeight:1.85, color:C.textMd }}>
              HutanKita hadir karena kami percaya setiap warga negara berhak tahu kondisi hutannya — dan punya kekuatan untuk menjaganya.
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, lineHeight:1.85, color:C.textMd }}>
              Kami menghubungkan masyarakat, aktivis, jurnalis, dan pengambil kebijakan dalam satu ekosistem data yang terbuka, terverifikasi, dan dapat ditindaklanjuti.
            </p>
            <div style={{ display:'flex', gap:16, alignItems:'center', paddingTop:6, flexWrap:'wrap' }}>
              <Link to="/donate" className="btn-lime">
                Ikut Berkontribusi <span className="ac"><ArrowRight size={15}/></span>
              </Link>
              <Link to="/map" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd, textDecoration:'none', fontWeight:500, display:'flex', alignItems:'center', gap:5, borderBottom:`1.5px solid ${C.textLt}`, paddingBottom:2 }}>
                Lihat Peta <ArrowUpRight size={14}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ══ */}
      <section className="sec-pad" style={{ background:C.offWhite, padding:'80px 60px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="pill-tag" style={{ marginBottom:14, display:'inline-flex' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
              Perjalanan Kami
            </span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:34, color:C.textDk, letterSpacing:'-.5px', marginTop:10 }}>Dari Ide ke Dampak Nyata</h2>
          </div>

          <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
            {/* Vertical line */}
            <div className="timeline-line" style={{ position:'absolute', left:103, top:7, bottom:7, width:2, background:`linear-gradient(to bottom, ${C.lime}, ${C.lime}40)`, borderRadius:2 }}/>

            <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
              {TIMELINE.map((item, i) => (
                <div key={item.year} className="tl-row" style={{ display:'flex', alignItems:'flex-start' }}>
                  {/* Year */}
                  <div className="year-col" style={{ width:96, flexShrink:0, display:'flex', justifyContent:'flex-end', paddingRight:20 }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:C.greenMd, lineHeight:'14px' }}>{item.year}</span>
                  </div>
                  {/* Dot */}
                  <div className="tl-dot" style={{ width:14, height:14, borderRadius:'50%', zIndex:10, flexShrink:0, background:i===TIMELINE.length-1?C.lime:'#fff', border:`2px solid ${C.lime}`, boxShadow:i===TIMELINE.length-1?`0 0 0 5px ${C.lime}30`:'none' }}/>
                  {/* Content */}
                  <div style={{ paddingLeft:20, flex:1 }}>
                    {/* Tahun tampil di mobile (year-col hidden) */}
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:11.5, fontWeight:800, color:C.greenMd, marginBottom:3, display:'none' }} className="year-mobile">{item.year}</p>
                    <style>{`@media(max-width:768px){.year-mobile{display:block!important}}`}</style>
                    <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk, marginBottom:6, lineHeight:'14px' }}>{item.title}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd, lineHeight:1.75, marginTop:8 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="sec-pad" style={{ background:'#fff', padding:'80px 60px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:44, flexWrap:'wrap', gap:16 }}>
            <div>
              <span className="pill-tag" style={{ marginBottom:12, display:'inline-flex' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
                Nilai-Nilai Kami
              </span>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:34, color:C.textDk, letterSpacing:'-.5px', marginTop:10 }}>Apa yang Kami Pegang</h2>
            </div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt, maxWidth:300, lineHeight:1.75 }}>
              Prinsip-prinsip ini tertanam dalam setiap fitur yang kami bangun.
            </p>
          </div>
          <div className="val-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {VALUES.map(({ icon:Icon, color, title, desc }) => (
              <div key={title} className="val-card">
                <div style={{ width:42, height:42, borderRadius:12, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                  <Icon size={20} color={color}/>
                </div>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:9 }}>{title}</p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textMd, lineHeight:1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section className="sec-pad" style={{ background:C.offWhite, padding:'80px 60px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span className="pill-tag" style={{ marginBottom:14, display:'inline-flex' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.lime, display:'inline-block' }}/>
              Tim Kami
            </span>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:34, color:C.textDk, letterSpacing:'-.5px', marginBottom:12, marginTop:10 }}>
              Orang-orang di Balik HutanKita
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textLt, maxWidth:460, margin:'0 auto', lineHeight:1.75 }}>
              Tim kecil yang bersemangat besar tentang masa depan hutan Indonesia.
            </p>
          </div>

          <div className="team-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {TEAM.map(({ name, role, photo }) => (
              <div key={name} className="team-card">
                <div className="team-photo" style={{ height:180, position:'relative', overflow:'hidden', borderBottom:`1px solid ${C.border}` }}>
                  <img src={photo} alt={name}
                    style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block', transition:'transform .5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
                  />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.18) 0%,transparent 50%)', pointerEvents:'none' }}/>
                </div>
                <div style={{ padding:'16px 18px' }}>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk, marginBottom:4 }}>{name}</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.textLt }}>{role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Join hint */}
          <div style={{ marginTop:24, background:'#fff', borderRadius:18, border:`1px solid ${C.border}`, padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
            <div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:C.textDk, marginBottom:5 }}>Bergabung dengan Tim Kami</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.textLt }}>Kami mencari developer, desainer, dan aktivis lingkungan.</p>
            </div>
            <a href="mailto:halo@hutankita.id" style={{ display:'inline-flex', alignItems:'center', gap:7, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:C.greenMd, fontWeight:600, textDecoration:'none', borderBottom:`1.5px solid ${C.greenMd}`, paddingBottom:2, flexShrink:0 }}>
              <Mail size={14}/> Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section sec-pad" style={{ background:'#fff', padding:'52px 60px 80px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="cta-inner" style={{ background:C.green, borderRadius:26, padding:'56px 60px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', background:'rgba(181,226,53,.07)', pointerEvents:'none' }}/>
            <div className="cta-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:32, position:'relative', flexWrap:'wrap' }}>
              <div style={{ maxWidth:520 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.lime, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', display:'block', marginBottom:14 }}>Mulai Sekarang</span>
                <h2 className="cta-h2" style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:40, color:'#fff', lineHeight:1.1, letterSpacing:'-.5px', marginBottom:16 }}>
                  Jadilah Bagian dari<br/><span style={{ color:C.lime }}>Gerakan Ini</span>
                </h2>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14.5, color:'rgba(255,255,255,.42)', lineHeight:1.8 }}>
                  Laporkan deforestasi, donasikan pohon, atau sebarkan informasi. Setiap kontribusi kecil memberi dampak nyata.
                </p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12, flexShrink:0 }}>
                <Link to="/report" className="btn-lime" style={{ fontSize:15, padding:'13px 13px 13px 26px' }}>
                  Buat Laporan <span className="ac" style={{ width:34, height:34 }}><ArrowRight size={14}/></span>
                </Link>
                <Link to="/donate" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:'rgba(255,255,255,.5)', textDecoration:'none', fontWeight:500, padding:'8px 0', transition:'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,.9)'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.5)'}>
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