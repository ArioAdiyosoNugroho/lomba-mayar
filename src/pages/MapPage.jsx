import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Filter, AlertTriangle, MapPin, ArrowRight, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';

if (!document.getElementById('map-fonts')) {
  const l = document.createElement('link');
  l.id = 'map-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const C = {
  green:'#1b3a2b', greenMd:'#2d6a4f', lime:'#b5e235',
  offWhite:'#f5f5f0', textDk:'#0f1a10', textMd:'#4a5544',
  textLt:'#8a9984', border:'rgba(0,0,0,.08)',
};

const SEVERITY = {
  low:      { color:'#3b82f6', label:'Rendah'  },
  medium:   { color:'#f59e0b', label:'Sedang'  },
  high:     { color:'#f97316', label:'Tinggi'  },
  critical: { color:'#ef4444', label:'Kritis'  },
};

const TYPE_MAP = {
  all:             { label:'Semua'           },
  sawit_expansion: { label:'Ekspansi Sawit'  },
  illegal_logging: { label:'Penebangan Liar' },
  forest_fire:     { label:'Kebakaran'       },
  land_clearing:   { label:'Buka Lahan'      },
  mining:          { label:'Tambang'         },
};

function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
      <div style="width:18px;height:18px;border-radius:50%;background:${color};
        border:3px solid #fff;
        box-shadow:0 0 0 3px ${color}44,0 0 12px ${color}88,0 3px 8px rgba(0,0,0,.4);">
      </div>
    </div>`,
    iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -22],
  });
}

function clusterIcon(cluster) {
  const n = cluster.getChildCount();
  const s = n < 5 ? 34 : n < 20 ? 42 : 50;
  return L.divIcon({
    className: '',
    html: `<div style="width:${s}px;height:${s}px;border-radius:50%;
      background:rgba(27,58,43,.88);border:2.5px solid #b5e235;
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-weight:700;
      font-size:${s < 38 ? 12 : 14}px;color:#fff;
      box-shadow:0 0 0 4px rgba(181,226,53,.18),0 4px 12px rgba(0,0,0,.35);">
      ${n}
    </div>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

const CSS = `
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body { font-family:'DM Sans',sans-serif; overflow:hidden; }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }

  .sf-btn {
    width:100%; text-align:left; display:flex; align-items:center; gap:9px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:400;
    color:${C.textMd}; background:transparent; border:none; cursor:pointer;
    padding:9px 12px; border-radius:10px; transition:background .18s,color .18s;
  }
  .sf-btn:hover  { background:rgba(0,0,0,.05); color:${C.textDk}; }
  .sf-btn.active { background:${C.green}; color:#fff; font-weight:500; }

  .rep-item {
    width:100%; text-align:left; background:transparent;
    display:flex; align-items:flex-start; gap:10px;
    padding:12px 16px; border-bottom:1px solid rgba(0,0,0,.06);
    transition:background .18s; text-decoration:none; color:inherit; cursor:pointer;
  }
  .rep-item:hover { background:${C.offWhite}; }
  .rep-item.sel   { background:${C.offWhite}; border-left:3px solid ${C.lime}; }

  .mob-pill {
    flex-shrink:0; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
    color:${C.textMd}; background:#fff; border:1px solid ${C.border};
    padding:6px 14px; border-radius:99px; cursor:pointer; white-space:nowrap;
    transition:background .18s,color .18s;
  }
  .mob-pill.active { background:${C.green}; color:#fff; border-color:${C.green}; }

  .leaflet-popup-content-wrapper {
    border-radius:20px!important; padding:0!important; overflow:hidden;
    background:#1b3a2b!important;
    box-shadow:0 16px 48px rgba(0,0,0,.35),0 4px 12px rgba(0,0,0,.2)!important;
    border:1px solid rgba(181,226,53,.2)!important;
  }
  .leaflet-popup-content { margin:0!important; }
  .leaflet-popup-tip { background:#1b3a2b!important; }
  .leaflet-popup-close-button {
    color:rgba(255,255,255,.5)!important; font-size:18px!important;
    padding:8px 10px!important;
  }
  .leaflet-popup-close-button:hover { color:#fff!important; }

  /* Sembunyikan attribution di mobile agar tidak tumpuk */
  @media (max-width:768px) {
    .leaflet-control-attribution { font-size:9px!important; max-width:160px; }
    .leaflet-control-zoom { margin-bottom:140px!important; }
  }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12); border-radius:99px; }
`;

export default function MapPage() {
  const [reports,       setReports]       = useState([]);
  const [filter,        setFilter]        = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [isMobile,      setIsMobile]      = useState(false);
  const [sheetOpen,     setSheetOpen]     = useState(false);   // bottom sheet reports
  const [filterOpen,    setFilterOpen]    = useState(false);   // bottom sheet filter
  const markerRefs = useRef({});

  /* Deteksi mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchReports = useCallback(() => {
    setLoading(true);
    api.get('/reports/map')
      .then(r => {
        const raw = r.data;
        const arr = Array.isArray(raw) ? raw
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.data?.data) ? raw.data.data : [];
        setReports(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filtered  = reports.filter(r => filter === 'all' || r.type === filter);
  const critCount = filtered.filter(r => r.severity === 'critical').length;

  /* Tinggi area map = 100vh - navbar (80px) */
  const mapH = 'calc(100vh - 80px)';

  return (
    <>
      <style>{CSS}</style>

      <div style={{ display:'flex', height:mapH, position:'relative', overflow:'hidden' }}>

        {/* ══ SIDEBAR — hanya desktop ══════════════════════════════ */}
        {!isMobile && (
          <aside style={{
            width:288, flexShrink:0, background:'#fff',
            borderRight:`1px solid ${C.border}`,
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            {/* Sidebar header */}
            <div style={{ background:C.green, padding:'18px 16px', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#fff' }}>
                  Peta Ancaman Hutan
                </h2>
                <button onClick={fetchReports} title="Refresh"
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.lime, display:'flex' }}>
                  <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
                </button>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.lime, fontWeight:500 }}>
                  {filtered.length} laporan
                </span>
                {critCount > 0 && (
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#fca5a5', display:'flex', alignItems:'center', gap:4, fontWeight:500 }}>
                    <AlertTriangle size={11}/> {critCount} kritis
                  </span>
                )}
              </div>
            </div>

            {/* Filters */}
            <div style={{ padding:'12px', borderBottom:`1px solid ${C.border}` }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', padding:'2px 4px 8px' }}>
                Filter Jenis
              </p>
              {Object.entries(TYPE_MAP).map(([key, { label }]) => (
                <button key={key} className={`sf-btn${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
                  {label}
                  <span style={{ marginLeft:'auto', fontSize:11, opacity:.6 }}>
                    {key === 'all' ? reports.length : reports.filter(r => r.type === key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ flex:1, overflowY:'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding:'32px 16px', textAlign:'center' }}>
                  <MapPin size={28} color="rgba(0,0,0,.15)" style={{ marginBottom:10 }}/>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>Tidak ada laporan</p>
                </div>
              ) : filtered.map(r => {
                const sv = SEVERITY[r.severity] ?? SEVERITY.low;
                return (
                  <Link key={r.id} to={`/reports/${r.id}`}
                    className={`rep-item${selected?.id === r.id ? ' sel' : ''}`}
                    onClick={() => setSelected(r)}
                  >
                    <span style={{ width:9, height:9, borderRadius:'50%', background:sv.color, flexShrink:0, marginTop:4 }}/>
                    <div style={{ minWidth:0, flex:1 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500, color:C.textDk, lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        {r.title}
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, marginTop:3 }}>
                        {sv.label} · {TYPE_MAP[r.type]?.label ?? r.type}
                      </p>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:3, marginTop:4, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.greenMd, fontWeight:500 }}>
                        Lihat detail <ArrowRight size={10}/>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        )}

        {/* ══ MAP AREA ══════════════════════════════════════════════ */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>

          {/* Loading indicator */}
          {loading && (
            <div style={{
              position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
              zIndex:1000, background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
              border:`1px solid ${C.border}`, borderRadius:99,
              padding:'8px 20px', display:'flex', alignItems:'center', gap:10,
            }}>
              <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${C.border}`, borderTopColor:C.greenMd, animation:'spin 1s linear infinite' }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textMd }}>Memuat peta…</span>
            </div>
          )}

          {/* ── Mobile top bar: filter + stats ── */}
          {isMobile && (
            <div style={{
              position:'absolute', top:0, left:0, right:0, zIndex:900,
              background:'rgba(255,255,255,.95)', backdropFilter:'blur(10px)',
              borderBottom:`1px solid ${C.border}`,
              padding:'8px 12px',
              display:'flex', alignItems:'center', gap:8,
            }}>
              {/* Filter toggle */}
              <button
                onClick={() => { setFilterOpen(v => !v); setSheetOpen(false); }}
                style={{
                  display:'flex', alignItems:'center', gap:5,
                  background: filterOpen ? C.green : '#fff',
                  color: filterOpen ? '#fff' : C.textMd,
                  border:`1px solid ${filterOpen ? C.green : C.border}`,
                  borderRadius:99, padding:'6px 12px',
                  fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500,
                  cursor:'pointer', flexShrink:0,
                }}
              >
                <Filter size={12}/> Filter
              </button>

              {/* Scrollable filter pills */}
              <div style={{ display:'flex', gap:6, overflowX:'auto', flex:1 }}>
                {Object.entries(TYPE_MAP).map(([key, { label }]) => (
                  <button key={key} className={`mob-pill${filter === key ? ' active' : ''}`}
                    onClick={() => setFilter(key)}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Refresh */}
              <button onClick={fetchReports}
                style={{ background:'none', border:'none', cursor:'pointer', color:C.greenMd, flexShrink:0, padding:4 }}>
                <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
              </button>
            </div>
          )}

          <MapContainer
            center={[-2.5489, 118.0149]} zoom={5}
            style={{ height:'100%', width:'100%' }}
            zoomControl={!isMobile}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />

            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={clusterIcon}
              maxClusterRadius={48}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
              zoomToBoundsOnClick
            >
              {filtered.map(r => (
                <Marker
                  key={r.id}
                  position={[r.lat, r.lng]}
                  icon={coloredIcon(SEVERITY[r.severity]?.color ?? '#6b7280')}
                  ref={el => { if (el) markerRefs.current[r.id] = el; }}
                  eventHandlers={{
                    click: () => {
                      setSelected(r);
                      const marker = markerRefs.current[r.id];
                      if (marker) marker.openPopup();
                    },
                  }}
                >
                  <Popup>
                    <div style={{ width: isMobile ? 220 : 240, fontFamily:"'DM Sans',sans-serif", background:'#1b3a2b' }}>
                      {r.photo_url && (
                        <div style={{ position:'relative', overflow:'hidden' }}>
                          <img src={r.photo_url} alt={r.title}
                            style={{ width:'100%', height: isMobile ? 100 : 130, objectFit:'cover', display:'block', opacity:.9 }}/>
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40, background:'linear-gradient(to bottom,transparent,#1b3a2b)' }}/>
                        </div>
                      )}
                      <div style={{ padding:'12px 14px 14px' }}>
                        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13.5, color:'#fff', lineHeight:1.35, marginBottom:9 }}>
                          {r.title}
                        </p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                          {(() => {
                            const sv = SEVERITY[r.severity] ?? SEVERITY.low;
                            return (
                              <span style={{
                                display:'inline-flex', alignItems:'center', gap:5,
                                background:'rgba(255,255,255,.1)', color:'#fff',
                                borderRadius:99, padding:'3px 9px', fontSize:11, fontWeight:600,
                                border:`1px solid ${sv.color}55`,
                              }}>
                                <span style={{ width:6, height:6, borderRadius:'50%', background:sv.color, flexShrink:0 }}/>
                                {sv.label}
                              </span>
                            );
                          })()}
                          <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.65)', borderRadius:99, padding:'3px 9px', fontSize:11, border:'1px solid rgba(255,255,255,.1)' }}>
                            {TYPE_MAP[r.type]?.label ?? r.type}
                          </span>
                        </div>
                        <Link to={`/reports/${r.id}`} style={{
                          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                          background:'#b5e235', color:'#0f1a10',
                          borderRadius:10, padding:'9px 12px',
                          fontSize:12, fontWeight:700, textDecoration:'none',
                        }}>
                          Lihat Detail <ArrowRight size={12}/>
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>

          {/* ── Desktop: stats badge kiri bawah ── */}
          {!isMobile && (
            <div style={{
              position:'absolute', bottom:28, left:16, zIndex:1000,
              background:'rgba(255,255,255,.92)', backdropFilter:'blur(10px)',
              border:`1px solid ${C.border}`, borderRadius:14,
              padding:'10px 16px', display:'flex', alignItems:'center', gap:14,
              boxShadow:'0 4px 20px rgba(0,0,0,.1)',
            }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:C.textDk, lineHeight:1 }}>{filtered.length}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLt, marginTop:2 }}>laporan</div>
              </div>
              {critCount > 0 && (
                <>
                  <div style={{ width:1, height:28, background:C.border }}/>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, color:'#ef4444', lineHeight:1 }}>{critCount}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLt, marginTop:2 }}>kritis</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Desktop: legend kanan bawah ── */}
          {!isMobile && (
            <div style={{
              position:'absolute', bottom:28, right:16, zIndex:1000,
              background:'rgba(255,255,255,.92)', backdropFilter:'blur(10px)',
              border:`1px solid ${C.border}`, borderRadius:14,
              padding:'14px 16px', boxShadow:'0 4px 20px rgba(0,0,0,.1)',
            }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>
                Keparahan
              </p>
              {Object.entries(SEVERITY).map(([k, v]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:v.color, flexShrink:0 }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.textMd }}>{v.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Mobile: Zoom controls kanan tengah ── */}
          {isMobile && (
            <div style={{
              position:'absolute', right:12,
              /* Di atas bottom sheet — sesuaikan dengan tinggi sheet */
              bottom: sheetOpen ? 260 : 100,
              zIndex:900,
              display:'flex', flexDirection:'column', gap:6,
              transition:'bottom .3s ease',
            }}>
              {/* Legend mini */}
              <div style={{
                background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
                border:`1px solid ${C.border}`, borderRadius:12,
                padding:'10px 12px',
              }}>
                {Object.entries(SEVERITY).map(([k, v]) => (
                  <div key={k} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:v.color, flexShrink:0 }}/>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textMd }}>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Mobile: Bottom Sheet toggle button ── */}
          {isMobile && (
            <button
              onClick={() => { setSheetOpen(v => !v); setFilterOpen(false); }}
              style={{
                position:'absolute', bottom: sheetOpen ? 248 : 16, left:'50%',
                transform:'translateX(-50%)',
                zIndex:1001,
                background:C.green, color:'#fff',
                border:'none', borderRadius:99,
                padding:'10px 20px',
                fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
                display:'flex', alignItems:'center', gap:7, cursor:'pointer',
                boxShadow:'0 4px 20px rgba(0,0,0,.25)',
                transition:'bottom .3s ease',
                whiteSpace:'nowrap',
              }}
            >
              {sheetOpen ? <><ChevronDown size={15}/> Tutup</> : <><ChevronUp size={15}/> {filtered.length} Laporan</>}
              {critCount > 0 && !sheetOpen && (
                <span style={{ background:'#ef4444', borderRadius:99, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
                  {critCount} kritis
                </span>
              )}
            </button>
          )}

          {/* ── Mobile: Bottom Sheet laporan ── */}
          {isMobile && sheetOpen && (
            <div style={{
              position:'absolute', bottom:0, left:0, right:0,
              height:248, zIndex:1000,
              background:'#fff',
              borderRadius:'20px 20px 0 0',
              boxShadow:'0 -4px 32px rgba(0,0,0,.15)',
              display:'flex', flexDirection:'column',
              animation:'slideUp .3s ease',
            }}>
              {/* Handle */}
              <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 6px' }}>
                <div style={{ width:36, height:4, borderRadius:99, background:C.border }}/>
              </div>

              {/* Sheet header */}
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'0 16px 10px',
                borderBottom:`1px solid ${C.border}`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk }}>
                    Laporan
                  </span>
                  <span style={{ background:C.lime, color:C.textDk, borderRadius:99, padding:'2px 9px', fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:700 }}>
                    {filtered.length}
                  </span>
                  {critCount > 0 && (
                    <span style={{ background:'#fef2f2', color:'#ef4444', borderRadius:99, padding:'2px 9px', fontFamily:"'DM Sans',sans-serif", fontSize:11.5, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                      <AlertTriangle size={10}/> {critCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setSheetOpen(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.textLt, padding:4 }}>
                  <X size={18}/>
                </button>
              </div>

              {/* List horizontal scroll di mobile */}
              <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding:'20px 16px', textAlign:'center' }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>Tidak ada laporan</p>
                  </div>
                ) : filtered.map(r => {
                  const sv = SEVERITY[r.severity] ?? SEVERITY.low;
                  return (
                    <Link key={r.id} to={`/reports/${r.id}`}
                      className={`rep-item${selected?.id === r.id ? ' sel' : ''}`}
                      onClick={() => { setSelected(r); setSheetOpen(false); }}
                    >
                      <span style={{ width:8, height:8, borderRadius:'50%', background:sv.color, flexShrink:0, marginTop:4 }}/>
                      <div style={{ minWidth:0, flex:1 }}>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C.textDk, lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {r.title}
                        </p>
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textLt, marginTop:2 }}>
                          {sv.label} · {TYPE_MAP[r.type]?.label ?? r.type}
                        </p>
                      </div>
                      <ArrowRight size={14} color={C.greenMd} style={{ flexShrink:0 }}/>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Mobile: Filter bottom sheet ── */}
          {isMobile && filterOpen && (
            <div style={{
              position:'absolute', bottom:0, left:0, right:0,
              zIndex:1002,
              background:'#fff',
              borderRadius:'20px 20px 0 0',
              boxShadow:'0 -4px 32px rgba(0,0,0,.15)',
              animation:'slideUp .3s ease',
              padding:'0 0 24px',
            }}>
              {/* Handle */}
              <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 6px' }}>
                <div style={{ width:36, height:4, borderRadius:99, background:C.border }}/>
              </div>

              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px 14px', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:C.textDk }}>Filter Laporan</span>
                <button onClick={() => setFilterOpen(false)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:C.textLt, padding:4 }}>
                  <X size={18}/>
                </button>
              </div>

              {/* Filter options */}
              <div style={{ padding:'12px 12px 0' }}>
                {Object.entries(TYPE_MAP).map(([key, { label }]) => (
                  <button key={key}
                    className={`sf-btn${filter === key ? ' active' : ''}`}
                    onClick={() => { setFilter(key); setFilterOpen(false); }}
                    style={{ fontSize:14, padding:'11px 14px' }}
                  >
                    {label}
                    <span style={{ marginLeft:'auto', fontSize:12, opacity:.6 }}>
                      {key === 'all' ? reports.length : reports.filter(r => r.type === key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Overlay tap-to-close sheets */}
          {isMobile && (sheetOpen || filterOpen) && (
            <div
              onClick={() => { setSheetOpen(false); setFilterOpen(false); }}
              style={{
                position:'absolute', inset:0, zIndex:999,
                background:'rgba(0,0,0,.15)',
              }}
            />
          )}

        </div>
      </div>
    </>
  );
}