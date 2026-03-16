import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, MapPin, ArrowRight,
  RefreshCw, ChevronUp, ChevronDown, List,
} from 'lucide-react';

/* ── Fonts ─────────────────────────────────────────────────────── */
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

/* ── Tokens ─────────────────────────────────────────────────────── */
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
  all:             { label:'Semua',          emoji:'🗺️' },
  sawit_expansion: { label:'Ekspansi Sawit', emoji:'🌴' },
  illegal_logging: { label:'Penebangan',     emoji:'🪓' },
  forest_fire:     { label:'Kebakaran',      emoji:'🔥' },
  land_clearing:   { label:'Buka Lahan',     emoji:'🚜' },
  mining:          { label:'Tambang',        emoji:'⛏️' },
};

/* ── Leaflet icons ──────────────────────────────────────────────── */
function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
      <div style="width:20px;height:20px;border-radius:50%;background:${color};
        border:3px solid #fff;
        box-shadow:0 0 0 3px ${color}44,0 0 14px ${color}99,0 3px 8px rgba(0,0,0,.4);">
      </div></div>`,
    iconSize:[44,44], iconAnchor:[22,22], popupAnchor:[0,-26],
  });
}

function clusterIcon(cluster) {
  const n = cluster.getChildCount();
  const s = n < 5 ? 36 : n < 20 ? 44 : 52;
  return L.divIcon({
    className:'',
    html:`<div style="width:${s}px;height:${s}px;border-radius:50%;
      background:rgba(27,58,43,.92);border:2.5px solid #b5e235;
      display:flex;align-items:center;justify-content:center;
      font-family:'Syne',sans-serif;font-weight:700;
      font-size:${s<40?12:14}px;color:#fff;
      box-shadow:0 0 0 4px rgba(181,226,53,.2),0 4px 14px rgba(0,0,0,.38);">${n}</div>`,
    iconSize:[s,s], iconAnchor:[s/2,s/2],
  });
}

/* ── Global CSS ─────────────────────────────────────────────────── */
const CSS = `
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  html,body { font-family:'DM Sans',sans-serif; }

  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }

  /* Desktop sidebar */
  .sf-btn {
    width:100%; text-align:left; display:flex; align-items:center; gap:9px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:400;
    color:${C.textMd}; background:transparent; border:none; cursor:pointer;
    padding:9px 12px; border-radius:10px; transition:background .15s,color .15s;
  }
  .sf-btn:hover  { background:rgba(0,0,0,.05); color:${C.textDk}; }
  .sf-btn.active { background:${C.green}; color:#fff; font-weight:500; }

  .rep-item {
    width:100%; text-align:left; background:transparent;
    display:flex; align-items:flex-start; gap:10px;
    padding:12px 16px; border-bottom:1px solid rgba(0,0,0,.06);
    transition:background .15s; text-decoration:none; color:inherit;
  }
  .rep-item:hover { background:${C.offWhite}; }
  .rep-item.sel   { background:${C.offWhite}; border-left:3px solid ${C.lime}; }

  /* Mobile chips */
  .chip {
    flex-shrink:0; display:inline-flex; align-items:center; gap:5px;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
    color:${C.textMd}; background:rgba(255,255,255,.95);
    border:1.5px solid rgba(0,0,0,.1);
    padding:7px 14px; border-radius:99px; cursor:pointer; white-space:nowrap;
    transition:all .15s; user-select:none;
    -webkit-tap-highlight-color:transparent;
  }
  .chip:active  { transform:scale(.95); }
  .chip.active  { background:${C.green}; color:#fff; border-color:${C.green}; }

  /* Mobile list card */
  .mob-rcard {
    display:flex; align-items:center; gap:12px;
    padding:14px 16px; border-bottom:1px solid rgba(0,0,0,.06);
    text-decoration:none; color:inherit; background:#fff;
    transition:background .15s;
    -webkit-tap-highlight-color:transparent;
    min-height:64px;
  }
  .mob-rcard:active { background:${C.offWhite}; }

  /* Popup */
  .leaflet-popup-content-wrapper {
    border-radius:20px!important; padding:0!important; overflow:hidden;
    background:#1b3a2b!important;
    box-shadow:0 20px 60px rgba(0,0,0,.4)!important;
    border:1px solid rgba(181,226,53,.2)!important;
  }
  .leaflet-popup-content { margin:0!important; }
  .leaflet-popup-tip { background:#1b3a2b!important; }
  .leaflet-popup-close-button {
    color:rgba(255,255,255,.5)!important; font-size:20px!important;
    padding:8px 10px!important; z-index:10!important;
  }
  .leaflet-popup-close-button:hover { color:#fff!important; }

  /* Scrollbar */
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12); border-radius:99px; }
  .hide-scrollbar::-webkit-scrollbar { display:none; }
  .hide-scrollbar { scrollbar-width:none; }
`;

/* ════════════════════════════════════════════════════════════════
   Sub-components defined OUTSIDE MapPage to prevent
   unmount/remount on every state change (the root cause of the
   popup bug — marker refs were lost on re-render).
════════════════════════════════════════════════════════════════ */

/* ── Popup card ── */
function PopupCard({ r }) {
  const sv = SEVERITY[r.severity] ?? SEVERITY.low;
  return (
    <div style={{ width:240, fontFamily:"'DM Sans',sans-serif" }}>
      {r.photo_url && (
        <div style={{ position:'relative', overflow:'hidden' }}>
          <img src={r.photo_url} alt={r.title}
            style={{ width:'100%', height:130, objectFit:'cover', display:'block', opacity:.9 }}/>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:44,
            background:'linear-gradient(to bottom,transparent,#1b3a2b)' }}/>
        </div>
      )}
      <div style={{ padding:'14px 16px 16px' }}>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14,
          color:'#fff', lineHeight:1.35, marginBottom:10 }}>{r.title}</p>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:14 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5,
            background:'rgba(255,255,255,.1)', color:'#fff',
            borderRadius:99, padding:'4px 10px', fontSize:11, fontWeight:600,
            border:`1px solid ${sv.color}55` }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:sv.color }}/>
            {sv.label}
          </span>
          <span style={{ background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.6)',
            borderRadius:99, padding:'4px 10px', fontSize:11,
            border:'1px solid rgba(255,255,255,.1)' }}>
            {TYPE_MAP[r.type]?.label ?? r.type}
          </span>
        </div>
        <Link to={`/reports/${r.id}`} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          background:C.lime, color:'#0f1a10', borderRadius:12, padding:'11px 14px',
          fontSize:13, fontWeight:700, textDecoration:'none', transition:'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='#c8f24d'}
        onMouseLeave={e => e.currentTarget.style.background=C.lime}
        >
          Lihat Detail <ArrowRight size={13}/>
        </Link>
      </div>
    </div>
  );
}

/* ── Desktop list item ── */
function DesktopListItem({ r, isSelected, onClick }) {
  const sv = SEVERITY[r.severity] ?? SEVERITY.low;
  return (
    <Link to={`/reports/${r.id}`}
      className={`rep-item${isSelected ? ' sel' : ''}`}
      onClick={onClick}>
      <span style={{ width:9, height:9, borderRadius:'50%', background:sv.color,
        flexShrink:0, marginTop:4 }}/>
      <div style={{ minWidth:0, flex:1 }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500,
          color:C.textDk, lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {r.title}
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt, marginTop:3 }}>
          {sv.label} · {TYPE_MAP[r.type]?.label ?? r.type}
        </p>
        <span style={{ display:'inline-flex', alignItems:'center', gap:3, marginTop:4,
          fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.greenMd, fontWeight:500 }}>
          Lihat detail <ArrowRight size={10}/>
        </span>
      </div>
    </Link>
  );
}

/* ── Mobile list item ── */
function MobileListItem({ r, onTap }) {
  const sv = SEVERITY[r.severity] ?? SEVERITY.low;
  return (
    <Link to={`/reports/${r.id}`} className="mob-rcard" onClick={onTap}>
      <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
        background:sv.color+'18', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ width:14, height:14, borderRadius:'50%', background:sv.color,
          display:'block', boxShadow:`0 0 0 3px ${sv.color}33` }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600,
          color:C.textDk, lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {r.title}
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11.5,
          color:C.textLt, marginTop:3 }}>
          {sv.label} · {TYPE_MAP[r.type]?.label ?? r.type}
        </p>
      </div>
      <ArrowRight size={15} color={C.textLt} style={{ flexShrink:0 }}/>
    </Link>
  );
}

/* ── Floating Legend (desktop map overlay) ── */
function FloatingLegend({ filtered }) {
  return (
    <div style={{
      position:'absolute', bottom:28, right:16, zIndex:1000,
      background:'rgba(255,255,255,.94)', backdropFilter:'blur(14px)',
      border:`1px solid ${C.border}`, borderRadius:16,
      padding:'12px 14px',
      boxShadow:'0 4px 24px rgba(0,0,0,.11)',
      minWidth:148,
    }}>
      {/* Header */}
      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:9.5, color:C.textLt,
        fontWeight:700, letterSpacing:'1.1px', textTransform:'uppercase',
        marginBottom:10,
      }}>
        Tingkat Keparahan
      </p>

      {/* Rows */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {Object.entries(SEVERITY).map(([k, v]) => {
          const count = filtered.filter(r => r.severity === k).length;
          return (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:8 }}>
              {/* Dot with glow */}
              <span style={{
                width:10, height:10, borderRadius:'50%',
                background:v.color, flexShrink:0,
                boxShadow:`0 0 0 3px ${v.color}28`,
              }}/>
              {/* Label */}
              <span style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:12,
                color:C.textDk, fontWeight:400, flex:1,
              }}>
                {v.label}
              </span>
              {/* Count pill */}
              <span style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
                color: count > 0 ? '#fff' : C.textLt,
                fontWeight:600,
                background: count > 0 ? v.color : 'rgba(0,0,0,.06)',
                borderRadius:99,
                padding:'1px 7px',
                minWidth:22,
                textAlign:'center',
                transition:'background .2s',
              }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider + total */}
      <div style={{
        marginTop:10, paddingTop:9,
        borderTop:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontSize:10.5,
          color:C.textLt, fontWeight:500,
        }}>
          Total
        </span>
        <span style={{
          fontFamily:"'Syne',sans-serif", fontSize:13,
          color:C.textDk, fontWeight:700,
        }}>
          {filtered.length}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function MapPage() {
  const [reports,  setReports]  = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [sheet,    setSheet]    = useState('peek'); // peek | half | full

  const markerRefs = useRef({}); // { [id]: L.Marker }
  const sheetRef   = useRef(null);
  const dragY0     = useRef(null);

  /* ── Fetch once ── */
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

  /* ── Marker click handler ── */
  const handleMarkerClick = useCallback((r) => {
    setSelected(r);
    const m = markerRefs.current[r.id];
    if (m) m.openPopup();
  }, []);

  /* ── Sheet drag ── */
  const onTouchStart = (e) => { dragY0.current = e.touches[0].clientY; };
  const onTouchEnd   = (e) => {
    if (dragY0.current == null) return;
    const dy = dragY0.current - e.changedTouches[0].clientY;
    if      (dy >  50) setSheet(s => s === 'peek' ? 'half' : 'full');
    else if (dy < -50) setSheet(s => s === 'full'  ? 'half' : 'peek');
    dragY0.current = null;
  };
  const toggleSheet = () =>
    setSheet(s => s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek');

  const SHEET_H = { peek: 76, half: '45vh', full: '82vh' };

  /* ── The one and only MapContainer (rendered once) ── */
  const mapContent = (
    <MapContainer center={[-2.5489, 118.0149]} zoom={5}
      style={{ height:'100%', width:'100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CARTO'
      />
      <MarkerClusterGroup
        chunkedLoading iconCreateFunction={clusterIcon}
        maxClusterRadius={48} spiderfyOnMaxZoom
        showCoverageOnHover={false} zoomToBoundsOnClick
      >
        {filtered.map(r => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={coloredIcon(SEVERITY[r.severity]?.color ?? '#6b7280')}
            ref={el => { if (el) markerRefs.current[r.id] = el; }}
            eventHandlers={{ click: () => handleMarkerClick(r) }}
          >
            <Popup>
              <PopupCard r={r}/>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );

  /* ════════════════════════════════════════════════════════════
     DESKTOP (≥769px) — sidebar + map side-by-side
  ════════════════════════════════════════════════════════════ */
  const desktopLayout = (
    <div style={{ display:'flex', height:'calc(100vh - 80px)' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:288, flexShrink:0, background:'#fff',
        borderRight:`1px solid ${C.border}`,
        display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background:C.green, padding:'20px 18px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:'#fff' }}>
              Peta Ancaman Hutan
            </h2>
            <button onClick={fetchReports}
              style={{ background:'none', border:'none', cursor:'pointer', color:C.lime, display:'flex', padding:4 }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.lime, fontWeight:500 }}>
              {filtered.length} laporan
            </span>
            {critCount > 0 && (
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#fca5a5',
                display:'flex', alignItems:'center', gap:4, fontWeight:500 }}>
                <AlertTriangle size={11}/> {critCount} kritis
              </span>
            )}
          </div>
        </div>

        {/* Type filters */}
        <div style={{ padding:'12px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:C.textLt,
            fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', padding:'2px 4px 8px' }}>
            Filter Jenis
          </p>
          {Object.entries(TYPE_MAP).map(([key, { label }]) => (
            <button key={key} className={`sf-btn${filter===key?' active':''}`}
              onClick={() => setFilter(key)}>
              {label}
              <span style={{ marginLeft:'auto', fontSize:11, opacity:.6 }}>
                {key==='all' ? reports.length : reports.filter(r=>r.type===key).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Report list — now takes ALL remaining space ── */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'32px 16px', textAlign:'center' }}>
              <MapPin size={28} color="rgba(0,0,0,.15)" style={{ marginBottom:10 }}/>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>
                Tidak ada laporan
              </p>
            </div>
          ) : filtered.map(r => (
            <DesktopListItem
              key={r.id} r={r}
              isSelected={selected?.id === r.id}
              onClick={() => setSelected(r)}
            />
          ))}
        </div>

        {/* ── Legend removed from here — moved to FloatingLegend on map ── */}

      </aside>

      {/* ── Map ── */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>

        {/* Loading indicator */}
        {loading && (
          <div style={{ position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
            zIndex:1000, background:'rgba(255,255,255,.92)', backdropFilter:'blur(8px)',
            border:`1px solid ${C.border}`, borderRadius:99,
            padding:'8px 20px', display:'flex', alignItems:'center', gap:10,
            boxShadow:'0 4px 16px rgba(0,0,0,.1)' }}>
            <div style={{ width:14, height:14, borderRadius:'50%',
              border:`2px solid ${C.border}`, borderTopColor:C.greenMd,
              animation:'spin 1s linear infinite' }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textMd }}>
              Memuat peta…
            </span>
          </div>
        )}

        {mapContent}

        {/* Stats badge — bottom LEFT */}
        <div style={{ position:'absolute', bottom:28, left:16, zIndex:1000,
          background:'rgba(255,255,255,.92)', backdropFilter:'blur(10px)',
          border:`1px solid ${C.border}`, borderRadius:14, padding:'10px 16px',
          display:'flex', alignItems:'center', gap:14, boxShadow:'0 4px 20px rgba(0,0,0,.1)' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700,
              color:C.textDk, lineHeight:1 }}>{filtered.length}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
              color:C.textLt, marginTop:2 }}>laporan</div>
          </div>
          {critCount > 0 && <>
            <div style={{ width:1, height:28, background:C.border }}/>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700,
                color:'#ef4444', lineHeight:1 }}>{critCount}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10,
                color:C.textLt, marginTop:2 }}>kritis</div>
            </div>
          </>}
        </div>

        {/* ✨ Floating legend — bottom RIGHT */}
        <FloatingLegend filtered={filtered} />

      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     MOBILE (≤768px) — full-screen map + overlays
  ════════════════════════════════════════════════════════════ */
  const mobileLayout = (
    <div style={{ position:'relative', height:'calc(100vh - 64px)', overflow:'hidden' }}>

      {/* Map fills entire screen */}
      <div style={{ position:'absolute', inset:0 }}>
        {mapContent}
      </div>

      {/* Top bar */}
      <div style={{ position:'absolute', top:12, left:50, right:12, zIndex:1000,
        display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ flex:1, background:'rgba(255,255,255,.95)', backdropFilter:'blur(10px)',
          border:`1px solid ${C.border}`, borderRadius:14, padding:'10px 14px',
          display:'flex', alignItems:'center', gap:10,
          boxShadow:'0 4px 20px rgba(0,0,0,.14)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.lime }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16,
              fontWeight:700, color:C.textDk, lineHeight:1 }}>{filtered.length}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt }}>laporan</span>
          </div>
          {critCount > 0 && <>
            <div style={{ width:1, height:18, background:C.border }}/>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <AlertTriangle size={12} color='#ef4444'/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15,
                fontWeight:700, color:'#ef4444', lineHeight:1 }}>{critCount}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLt }}>kritis</span>
            </div>
          </>}
          {filter !== 'all' && <>
            <div style={{ width:1, height:18, background:C.border }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
              color:C.greenMd, fontWeight:500 }}>
              {TYPE_MAP[filter]?.label}
            </span>
          </>}
        </div>
        <button onClick={fetchReports} style={{ width:44, height:44, borderRadius:12,
          background:'rgba(255,255,255,.95)', backdropFilter:'blur(10px)',
          border:`1px solid ${C.border}`, cursor:'pointer', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(0,0,0,.14)' }}>
          <RefreshCw size={16} color={C.greenMd}
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
        </button>
      </div>

      {/* Filter chips */}
      <div className="hide-scrollbar" style={{ position:'absolute', top:70, left:0, right:0,
        zIndex:1000, padding:'8px 12px',
        display:'flex', gap:7, overflowX:'auto' }}>
        {Object.entries(TYPE_MAP).map(([key, { label, emoji }]) => (
          <button key={key} className={`chip${filter===key?' active':''}`}
            onClick={() => setFilter(key)}>
            <span>{emoji}</span>{label}
            {key !== 'all' && (
              <span style={{ fontSize:10.5, opacity:.7, fontWeight:600,
                background: filter===key ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.06)',
                borderRadius:99, padding:'1px 6px' }}>
                {reports.filter(r=>r.type===key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom sheet */}
      <div ref={sheetRef} style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:1000,
        background:'#fff', borderRadius:'20px 20px 0 0',
        boxShadow:'0 -8px 40px rgba(0,0,0,.18)',
        height: SHEET_H[sheet],
        transition:'height .32s cubic-bezier(.2,0,0,1)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Handle + header */}
        <div style={{ flexShrink:0, cursor:'pointer', touchAction:'none',
          paddingTop:10 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={toggleSheet}
        >
          <div style={{ width:36, height:4, borderRadius:99,
            background:'rgba(0,0,0,.14)', margin:'0 auto 10px' }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'0 16px 12px', borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <List size={15} color={C.greenMd}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                fontSize:14, color:C.textDk }}>Daftar Laporan</span>
              <span style={{ background:C.green, color:C.lime,
                borderRadius:99, padding:'2px 9px',
                fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600 }}>
                {filtered.length}
              </span>
            </div>
            {sheet === 'full'
              ? <ChevronDown size={18} color={C.textLt}/>
              : <ChevronUp   size={18} color={C.textLt}/>
            }
          </div>
        </div>

        {/* List — only rendered when sheet is open */}
        {sheet !== 'peek' && (
          <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
            {filtered.length === 0 ? (
              <div style={{ padding:'32px 16px', textAlign:'center' }}>
                <MapPin size={28} color="rgba(0,0,0,.15)" style={{ marginBottom:10 }}/>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.textLt }}>
                  Tidak ada laporan
                </p>
              </div>
            ) : filtered.map(r => (
              <MobileListItem key={r.id} r={r} onTap={() => setSheet('peek')}/>
            ))}
          </div>
        )}

        {/* Peek teaser */}
        {sheet === 'peek' && filtered.length > 0 && (
          <div style={{ padding:'8px 16px 4px', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {(() => {
                const r  = filtered[0];
                const sv = SEVERITY[r.severity] ?? SEVERITY.low;
                return <>
                  <span style={{ width:10, height:10, borderRadius:'50%',
                    background:sv.color, flexShrink:0,
                    boxShadow:`0 0 0 3px ${sv.color}33` }}/>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5,
                    color:C.textMd, flex:1,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {r.title}
                  </p>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11,
                    color:C.textLt, flexShrink:0, whiteSpace:'nowrap' }}>
                    +{filtered.length - 1} lagi ↑
                  </span>
                </>;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div style={{ position:'absolute', inset:0, zIndex:2000,
          background:'rgba(245,245,240,.88)', backdropFilter:'blur(4px)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:14,
          animation:'fadeIn .2s ease' }}>
          <div style={{ width:44, height:44, borderRadius:'50%',
            border:`3px solid ${C.border}`, borderTopColor:C.greenMd,
            animation:'spin 1s linear infinite' }}/>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C.textMd }}>
            Memuat peta…
          </p>
        </div>
      )}
    </div>
  );

  /* ── Responsive render ── */
  return (
    <>
      <style>{CSS}</style>
      <div style={{ display:'none' }} className="desk-show">
        <style>{`@media (min-width:769px){.desk-show{display:block!important}}`}</style>
        {desktopLayout}
      </div>
      <div style={{ display:'none' }} className="mob-show">
        <style>{`@media (max-width:768px){.mob-show{display:block!important}}`}</style>
        {mobileLayout}
      </div>
    </>
  );
}