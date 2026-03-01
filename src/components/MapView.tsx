import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Popup, useMap, useMapEvents, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLayer, fetchRiskZones, fetchForecastZones } from '../services/api';

// Fix for default marker icons in React-Leaflet via Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const ZOOM_OUT_THRESHOLD = 10;

// Layer styling config — matches the Streamlit palette
const LAYER_STYLES: Record<string, L.PathOptions> = {
    admin: { color: '#4ade80', fillColor: 'transparent', weight: 3, dashArray: '6 8', opacity: 0.9 },
    flood: { color: '#FF4B4B', fillColor: '#FF4B4B', weight: 1, fillOpacity: 0.45, opacity: 0.85 },
    perm: { color: '#60a5fa', fillColor: '#60a5fa', weight: 1, fillOpacity: 0.35, opacity: 0.8 },
    pre: { color: '#818cf8', fillColor: '#818cf8', weight: 1, fillOpacity: 0.30, opacity: 0.75 },
    post: { color: '#facc15', fillColor: '#facc15', weight: 1, fillOpacity: 0.35, opacity: 0.8 },
    sar: { color: '#94a3b8', fillColor: '#94a3b8', weight: 1, fillOpacity: 0.25, opacity: 0.7 },
    optical: { color: '#67e8f9', fillColor: '#67e8f9', weight: 1, fillOpacity: 0.30, opacity: 0.75 },
    heatmap: { color: '#fbbf24', fillColor: '#fbbf24', weight: 1, fillOpacity: 0.40, opacity: 0.8 },
};

// Layers that come from the backend (not local OSM fetch)
const BACKEND_LAYERS = ['flood', 'perm', 'pre', 'post', 'sar', 'optical', 'heatmap'];

// Fly to coords smoothly
function FlyToCity({ coords, zoom }: { coords: [number, number]; zoom: number }) {
    const map = useMap();
    const prevCoords = useRef('');
    useEffect(() => {
        const key = `${coords[0]},${coords[1]}`;
        if (key !== prevCoords.current) {
            prevCoords.current = key;
            map.flyTo(coords, zoom, { duration: 1.8, easeLinearity: 0.2 });
        }
    }, [coords, zoom, map]);
    return null;
}

// Debounced zoom monitor
function ZoomMonitor({ onZoomOut }: { onZoomOut?: (lat: number, lng: number) => void }) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasTriggeredRef = useRef(false);

    useMapEvents({
        zoomend: (e) => {
            if (hasTriggeredRef.current) return;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                const z = e.target.getZoom();
                if (z < ZOOM_OUT_THRESHOLD && onZoomOut && !hasTriggeredRef.current) {
                    hasTriggeredRef.current = true;
                    const center = e.target.getCenter();
                    onZoomOut(center.lat, center.lng);
                }
            }, 500);
        }
    });
    return null;
}

export default function MapView({
    focusCoords = [18.520, 73.856],
    cityName = '',
    isAnalyzing = false,
    onZoomOut,
    activeLayers = ['admin', 'flood'],
    jobId = null,
    riskJobId = null,
    forecastJobId = null,
}: {
    focusCoords?: [number, number];
    cityName?: string;
    isAnalyzing?: boolean;
    onZoomOut?: (lat: number, lng: number) => void;
    activeLayers?: string[];
    jobId?: string | null;
    riskJobId?: string | null;
    forecastJobId?: string | null;
}) {
    const mapRef = useRef<any>(null);
    const [adminGeoJson, setAdminGeoJson] = useState<any>(null);
    const [layerData, setLayerData] = useState<Record<string, any>>({});
    const [loadingLayers, setLoadingLayers] = useState<Set<string>>(new Set());
    const [riskZones, setRiskZones] = useState<any>(null);
    const [forecastZones, setForecastZones] = useState<any>(null);

    // Fetch admin boundary from Nominatim whenever city changes
    useEffect(() => {
        if (!cityName) { setAdminGeoJson(null); return; }
        const fetchBoundary = async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=geojson&polygon_geojson=1&limit=5`
                );
                const data = await res.json();
                if (data?.features?.length > 0) {
                    const polygon = data.features.find((f: any) =>
                        f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
                    );
                    setAdminGeoJson(polygon || null);
                } else {
                    setAdminGeoJson(null);
                }
            } catch {
                setAdminGeoJson(null);
            }
        };
        fetchBoundary();
    }, [cityName]);

    // Fetch a backend layer on demand when:
    // 1. it becomes active, AND 2. we have a jobId, AND 3. not already loaded/loading
    const fetchBackendLayer = useCallback(async (layerName: string) => {
        if (!jobId) return;
        if (layerData[layerName] || loadingLayers.has(layerName)) return;

        setLoadingLayers(prev => new Set(prev).add(layerName));
        const gj = await fetchLayer(jobId, layerName);
        setLoadingLayers(prev => { const s = new Set(prev); s.delete(layerName); return s; });

        if (gj) {
            setLayerData(prev => ({ ...prev, [layerName]: gj }));
        }
    }, [jobId, layerData, loadingLayers]);

    // When activeLayers or jobId changes, kick off fetches for newly-active backend layers
    useEffect(() => {
        if (!jobId) return;
        activeLayers.forEach(layer => {
            if (BACKEND_LAYERS.includes(layer)) {
                fetchBackendLayer(layer);
            }
        });
    }, [activeLayers, jobId, fetchBackendLayer]);

    // When jobId resets (new analysis), clear stale layer data
    useEffect(() => {
        setLayerData({});
        setLoadingLayers(new Set());
    }, [jobId]);

    // Fetch risk zones when riskJobId changes
    useEffect(() => {
        if (!riskJobId) { setRiskZones(null); return; }
        fetchRiskZones(riskJobId).then(gj => setRiskZones(gj));
    }, [riskJobId]);

    // Fetch forecast zones when forecastJobId changes
    useEffect(() => {
        if (!forecastJobId) { setForecastZones(null); return; }
        fetchForecastZones(forecastJobId).then(gj => setForecastZones(gj));
    }, [forecastJobId]);

    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <MapContainer
                ref={mapRef}
                center={focusCoords}
                zoom={13}
                minZoom={5}
                maxZoom={18}
                style={{ width: '100%', height: '100%', background: '#0E1117' }}
                zoomControl={false}
                attributionControl={false}
                zoomAnimation={true}
                zoomSnap={0.5}
                wheelPxPerZoomLevel={120}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                    opacity={0.8}
                />

                <FlyToCity coords={focusCoords} zoom={13} />
                <ZoomMonitor onZoomOut={onZoomOut} />

                {/* ── Admin boundary (OSM) ── */}
                {activeLayers.includes('admin') && adminGeoJson && (
                    <GeoJSON
                        key={`admin-${cityName}`}
                        data={adminGeoJson}
                        pathOptions={LAYER_STYLES.admin}
                    />
                )}

                {/* ── Backend result layers ── */}
                {BACKEND_LAYERS.map(layerName => {
                    if (!activeLayers.includes(layerName)) return null;
                    const gj = layerData[layerName];
                    if (!gj) return null;
                    return (
                        <GeoJSON
                            key={`${layerName}-${jobId}`}
                            data={gj}
                            pathOptions={LAYER_STYLES[layerName] || {}}
                        />
                    );
                })}

                {/* ── Risk zone overlay (severity-coloured polygons) ── */}
                {riskZones && riskZones.features?.length > 0 && (() => {
                    const RISK_STYLES: Record<string, L.PathOptions> = {
                        MEDIUM:   { color: '#facc15', fillColor: '#facc15', weight: 2, fillOpacity: 0.18, opacity: 0.75, dashArray: '4 4' },
                        HIGH:     { color: '#fb923c', fillColor: '#fb923c', weight: 2, fillOpacity: 0.26, opacity: 0.85 },
                        CRITICAL: { color: '#FF4B4B', fillColor: '#FF4B4B', weight: 3, fillOpacity: 0.36, opacity: 1.0 },
                    };
                    return (
                        <GeoJSON
                            key={`risk-${riskJobId}`}
                            data={riskZones}
                            style={(feature) => RISK_STYLES[feature?.properties?.severity || 'MEDIUM'] || RISK_STYLES.MEDIUM}
                            onEachFeature={(feature, layer) => {
                                const sev = feature.properties?.severity || '?';
                                const rPct = feature.properties?.risk_pct ?? '?';
                                layer.bindPopup(
                                    `<div style="font-family:JetBrains Mono,monospace;color:#090b10;padding:4px">
                                        <b style="color:#fb923c;font-size:11px">⚠ ${sev} RISK ZONE</b><br/>
                                        <span style="font-size:10px;opacity:0.6">Risk Score: ${rPct}%</span>
                                    </div>`
                                );
                            }}
                        />
                    );
                })()}

                {/* ── Forecast zone overlay (purple/indigo polygons) ── */}
                {forecastZones && forecastZones.features?.length > 0 && (() => {
                    const FC_STYLES: Record<string, L.PathOptions> = {
                        MODERATE: { color: '#a78bfa', fillColor: '#a78bfa', weight: 2, fillOpacity: 0.18, opacity: 0.7, dashArray: '4 4' },
                        HIGH:     { color: '#818cf8', fillColor: '#818cf8', weight: 2, fillOpacity: 0.26, opacity: 0.85 },
                        CRITICAL: { color: '#6366f1', fillColor: '#6366f1', weight: 3, fillOpacity: 0.36, opacity: 1.0 },
                    };
                    return (
                        <GeoJSON
                            key={`forecast-${forecastJobId}`}
                            data={forecastZones}
                            style={(feature) => FC_STYLES[feature?.properties?.severity || 'MODERATE'] || FC_STYLES.MODERATE}
                            onEachFeature={(feature, layer) => {
                                const sev = feature.properties?.severity || '?';
                                const pct = feature.properties?.flood_prob_pct ?? '?';
                                layer.bindPopup(
                                    `<div style="font-family:JetBrains Mono,monospace;color:#090b10;padding:4px">
                                        <b style="color:#818cf8;font-size:11px">📅 7-DAY FORECAST: ${sev}</b><br/>
                                        <span style="font-size:10px;opacity:0.6">Flood Probability: ${pct}%</span>
                                    </div>`
                                );
                            }}
                        />
                    );
                })()}

                {/* ── City pin marker ── */}
                <Marker position={focusCoords}>
                    <Popup>
                        <div style={{ color: '#090b10', fontWeight: 'bold', fontSize: '13px', padding: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                            <span style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>{cityName || 'Target Zone'}</span>
                            <br />
                            <span style={{ fontWeight: 'normal', fontSize: '10px', opacity: 0.6, letterSpacing: '1px' }}>
                                {isAnalyzing ? 'ACTIVE SCAN...' : 'EXACT TARGET'}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Scan line overlay */}
            {isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 mix-blend-screen">
                    <div className="scan-line opacity-50" />
                </div>
            )}

            {/* Layer loading indicator */}
            {loadingLayers.size > 0 && (
                <div className="absolute top-5 right-5 z-30 flex items-center gap-2 bg-[#090b10]/90 border border-[#66FCF1]/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <div className="w-3 h-3 border-2 border-[#66FCF1]/20 border-t-[#66FCF1] rounded-full animate-spin" />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[9px] text-[#66FCF1]/60 uppercase tracking-wider">
                        Loading {[...loadingLayers].join(', ')}...
                    </span>
                </div>
            )}

            {/* Offline / no-job hint for backend layers */}
            {!jobId && activeLayers.some(l => BACKEND_LAYERS.includes(l)) && (
                <div className="absolute top-5 right-5 z-30 flex items-center gap-2 bg-[#090b10]/90 border border-yellow-500/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <span className="text-yellow-400/60 text-[10px]">⚠</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[9px] text-yellow-400/50 uppercase tracking-wider">
                        Run pipeline to load layers
                    </span>
                </div>
            )}

            {/* Map label overlay */}
            <div className="absolute top-5 left-6 z-30 pointer-events-none">
                <div className="bg-[#090b10]/95 backdrop-blur-3xl border border-[#66FCF1]/20 rounded-xl px-5 py-3"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 10px rgba(102,252,241,0.05)' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#66FCF1] animate-pulse" />
                        <p className="text-[#66FCF1] text-[10px] font-black uppercase tracking-[0.2em]"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            SAT-VIEW ACTIVE
                        </p>
                    </div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wide">
                        {cityName || 'Target Node'} — Alt &lt; 100km
                    </p>
                    {/* Active layer legend dots */}
                    {activeLayers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {activeLayers.map(l => {
                                const color = (LAYER_STYLES[l] as any)?.color || '#fff';
                                return (
                                    <div key={l} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                        <span className="text-[8px] text-white/30 uppercase tracking-wider">{l}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 35%, #090b10 95%)',
                }}
            />
        </div>
    );
}
