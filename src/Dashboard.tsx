import { useState, useCallback, useRef, useEffect } from 'react';
import GlobeView from './components/GlobeView';
import MapView from './components/MapView';
import CommandSidebar from './components/CommandSidebar';
import LayerPanel from './components/LayerPanel';
import MetricsPanel from './components/MetricsPanel';
import RiskPanel from './components/RiskPanel';
import ForecastPanel from './components/ForecastPanel';
import TerminalLog from './components/TerminalLog';
import {
    runAnalyze, runRiskAssessment, runForecast,
    getCityCoords, getPipelineStages, checkHealth,
    type AnalyzeResult, type RiskResult, type ForecastResult
} from './services/api';

export default function Dashboard() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalyzeResult | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [activeLayers, setActiveLayers] = useState<string[]>(['admin', 'flood']);
    const [logs, setLogs] = useState<string[]>([
        'SYSTEM ALIVE.',
        'AWAITING TARGET COORDINATES...'
    ]);
    const [focusCoords, setFocusCoords] = useState<[number, number]>([18.520, 73.856]);
    const [cityName, setCityName] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

    // Risk assessment state
    const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
    const [riskJobId, setRiskJobId] = useState<string | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);

    // 7-Day forecast state
    const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
    const [forecastJobId, setForecastJobId] = useState<string | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);

    const transitionLockRef = useRef(false);

    // Check backend health on mount
    useEffect(() => {
        checkHealth().then(ok => {
            setBackendOnline(ok);
            if (!ok) {
                setLogs(prev => [...prev,
                    '> WARNING: FastAPI backend not reachable at :8000',
                    '> Run: uvicorn api:app --reload --port 8000'
                ]);
            } else {
                setLogs(prev => [...prev, '> Backend API connected ✓']);
            }
        });
    }, []);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, msg]);
    }, []);

    const handleAnalyze = async (
        searchCity: string,
        preStart: string, preEnd: string,
        postStart: string, postEnd: string
    ) => {
        setIsAnalyzing(true);
        setResults(null);
        setJobId(null);
        setShowMap(false);
        setLogs([
            `> Initiating analysis for ${searchCity}...`,
            `> Pre-Event Window:  ${preStart} → ${preEnd}`,
            `> Post-Event Window: ${postStart} → ${postEnd}`,
            `> Resolving GAUL Level-2 boundary...`
        ]);

        setCityName(searchCity);

        const coords = await getCityCoords(searchCity);
        setFocusCoords(coords);
        setMapReady(true);

        const stages = getPipelineStages();
        const timers: ReturnType<typeof setTimeout>[] = [];
        stages.forEach(stage => {
            const t = setTimeout(() => {
                setLogs(prev => [...prev, ...stage.messages]);
            }, stage.delay);
            timers.push(t);
        });

        try {
            const response = await runAnalyze({
                location: searchCity,
                pre_start: preStart,
                pre_end: preEnd,
                post_start: postStart,
                post_end: postEnd,
            });

            timers.forEach(clearTimeout);
            setJobId(response.job_id);
            setResults(response.data);

            const d = response.data;
            setLogs(prev => [
                ...prev,
                `> Pipeline ${response.job_id.slice(0, 8)}... complete.`,
                `[STATUS: ${response.status}]`,
                `> New Flood Area: ${d.new_flood_area_km2} km² (${d.flood_percentage}% of AOI)`,
                `> Confidence: ${d.event_confidence_score} → ${d.confidence_category}`,
                ...(d.model_warnings.length > 0
                    ? d.model_warnings.map(w => `> ${w}`)
                    : ['> No model warnings.']),
            ]);

        } catch (err: any) {
            timers.forEach(clearTimeout);
            addLog(`> ERROR: ${err.message || 'Pipeline execution failed.'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleRiskAssess = async () => {
        if (!cityName) return;
        setIsAssessing(true);
        setRiskResult(null);
        setRiskJobId(null);
        addLog('> Starting 4-factor flood risk assessment...');
        addLog('> [1/4] SAR historical flood frequency (5-yr lookback)...');

        const now = new Date();
        const end = now.toISOString().slice(0, 10);
        const twoMonthsAgo = new Date(now);
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const start = twoMonthsAgo.toISOString().slice(0, 10);

        try {
            const risk = await runRiskAssessment({
                location: cityName,
                post_start: start,
                post_end: end,
            });
            setRiskResult(risk);
            setRiskJobId(risk.risk_job_id);
            if (!showMap) { setMapReady(true); setShowMap(true); }
            addLog(`> Risk assessment complete: ${risk.risk_score_pct}% (${risk.risk_category})`);
            addLog(`> At-risk area: ${risk.at_risk_area_km2} km² | Pop at risk: ${Math.round(risk.at_risk_pop).toLocaleString()}`);
        } catch (err: any) {
            addLog(`> RISK ERROR: ${err.message || 'Risk assessment failed.'}`);
        } finally {
            setIsAssessing(false);
        }
    };

    const handleForecast = async (targetCity: string) => {
        if (!targetCity) return;
        setIsForecasting(true);
        setForecastResult(null);
        setForecastJobId(null);

        setCityName(targetCity);
        const coords = await getCityCoords(targetCity);
        setFocusCoords(coords);
        setMapReady(true);

        addLog(`> [FORECAST] Starting 7-day flood forecast for ${targetCity}...`);
        addLog('> Running OLS regression on recent S1 passes + GEE bias corrections...');
        try {
            const fc = await runForecast({ location: targetCity });
            setForecastResult(fc);
            setForecastJobId(fc.forecast_job_id);
            if (!showMap) { setMapReady(true); setShowMap(true); }
            addLog(`> Forecast complete: ${fc.flood_probability_pct}% flood risk (${fc.risk_category})`);
            addLog(`> Rain probability: ${fc.rain_probability_pct}% | Expected: ${fc.expected_rain_7d_mm.toFixed(0)} mm in 7 days`);
        } catch (err: any) {
            addLog(`> FORECAST ERROR: ${err.message || 'Forecast failed.'}`);
        } finally {
            setIsForecasting(false);
        }
    };

    const toggleLayer = (layerId: string) => {
        setActiveLayers(prev =>
            prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]
        );
    };

    const handleZoomIn = useCallback((lat: number, lng: number) => {
        if (transitionLockRef.current) return;
        transitionLockRef.current = true;
        setFocusCoords([lat, lng]);
        setMapReady(true);
        setShowMap(true);
        setTimeout(() => { transitionLockRef.current = false; }, 2000);
    }, []);

    const handleZoomOut = useCallback((lat: number, lng: number) => {
        if (transitionLockRef.current) return;
        transitionLockRef.current = true;
        setFocusCoords([lat, lng]);
        setShowMap(false);
        setTimeout(() => { transitionLockRef.current = false; }, 2000);
    }, []);

    return (
        <div className="flex w-full h-screen bg-[#090b10] text-white overflow-hidden">

            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-[280px] w-[600px] h-[300px] bg-[#66FCF1]/[0.025] blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#7C3AED]/[0.03] blur-[100px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF4B4B]/[0.015] blur-[160px] rounded-full" />
            </div>

            {/* Sidebar */}
            <CommandSidebar
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                backendOnline={backendOnline}
                onForecast={handleForecast}
                isForecasting={isForecasting}
            />

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col h-screen overflow-hidden z-10">

                {/* Globe Layer */}
                <div className={`view-layer z-0 bg-[#090b10] ${showMap ? 'view-layer--globe-hidden' : 'view-layer--globe-active'}`}>
                    <GlobeView
                        focusCoords={focusCoords}
                        isAnalyzing={isAnalyzing}
                        cityName={cityName}
                        onZoomIn={handleZoomIn}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#090b10_85%)] pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#090b10] to-transparent pointer-events-none" />
                </div>

                {/* Map Layer */}
                <div className={`view-layer z-0 ${showMap ? 'view-layer--map-active' : 'view-layer--map-hidden'}`}>
                    {mapReady && (
                        <MapView
                            focusCoords={focusCoords}
                            cityName={cityName}
                            isAnalyzing={isAnalyzing}
                            onZoomOut={handleZoomOut}
                            activeLayers={activeLayers}
                            jobId={jobId}
                            riskJobId={riskJobId}
                            forecastJobId={forecastJobId}
                        />
                    )}
                </div>

                {/* View Toggle */}
                <button
                    onClick={() => {
                        if (transitionLockRef.current) return;
                        transitionLockRef.current = true;
                        if (!showMap) setMapReady(true);
                        setShowMap(!showMap);
                        setTimeout(() => { transitionLockRef.current = false; }, 2000);
                    }}
                    className="absolute top-5 right-5 z-40 group flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.07] bg-black/40 backdrop-blur-xl text-[11px] font-bold uppercase tracking-[0.12em] text-white/40 hover:text-[#66FCF1] hover:border-[#66FCF1]/30 hover:bg-[#66FCF1]/[0.04] transition-all duration-300"
                >
                    {showMap ? (
                        <><GlobeIcon /> Globe</>
                    ) : (
                        <><MapIcon /> Map</>
                    )}
                </button>

                {/* Scanning line when analyzing */}
                {isAnalyzing && <div className="scan-line z-50" />}

                {/* Top Status Bar */}
                <div className="relative z-20 pointer-events-none pt-5 pl-6 pr-24">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing || isForecasting ? 'bg-[#FF4B4B] pulse-red' : backendOnline ? 'bg-[#66FCF1] pulse-glow' : 'bg-yellow-400'}`} />
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[9px] font-medium text-white/20 uppercase tracking-[0.25em]">
                            PS-06 · Sentinel-1/2 · JRC · GAUL
                        </span>
                        {(isAnalyzing || isForecasting) && (
                            <span className="text-[9px] font-bold text-[#FF4B4B]/70 uppercase tracking-widest animate-pulse ml-2">
                                ◆ PIPELINE ACTIVE
                            </span>
                        )}
                        {backendOnline === false && (
                            <span className="text-[9px] font-bold text-yellow-400/70 uppercase tracking-widest ml-2">
                                ⚠ BACKEND OFFLINE
                            </span>
                        )}
                    </div>

                    {cityName && (
                        <div className="mt-3 flex items-baseline gap-3 animate-slideUp">
                            <h2 className="text-[28px] font-black tracking-tight text-white leading-none">
                                {cityName}
                            </h2>
                            <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full border ${showMap
                                ? 'text-[#66FCF1] border-[#66FCF1]/20 bg-[#66FCF1]/[0.06]'
                                : 'text-white/40 border-white/10 bg-white/[0.03]'
                                }`}>
                                {showMap ? '📡 Satellite' : '🌍 Globe'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Floating Layer Panel */}
                <LayerPanel activeLayers={activeLayers} toggleLayer={toggleLayer} />

                {/* Metrics Panel */}
                <div className="pointer-events-auto">
                    <MetricsPanel results={results} isAnalyzing={isAnalyzing} />
                </div>

                {/* Risk Assessment Panel */}
                {(results || riskResult || isAssessing) && (
                    <div className="pointer-events-auto absolute top-20 left-[310px] w-[340px] z-30 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                        <RiskPanel
                            onAssess={handleRiskAssess}
                            isAssessing={isAssessing}
                            riskResult={riskResult}
                            cityName={cityName}
                        />
                    </div>
                )}

                {/* Forecast Panel */}
                {(forecastResult || isForecasting) && (
                    <div className="pointer-events-auto absolute top-20 left-[660px] w-[340px] z-30 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                        <ForecastPanel result={forecastResult} isForecasting={isForecasting} />
                    </div>
                )}

                {/* Terminal */}
                <div className="pointer-events-auto">
                    <TerminalLog logs={logs} isAnalyzing={isAnalyzing} />
                </div>
            </main>
        </div>
    );
}

function GlobeIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function MapIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    );
}
