import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, Activity, Droplets, Radar, TrendingUp, Waves, MapPin, BarChart3 } from 'lucide-react';
import type { AnalyzeResult } from '../services/api';

export default function MetricsPanel({ results, isAnalyzing }: { results: AnalyzeResult | null, isAnalyzing: boolean }) {
    if (!results && !isAnalyzing) return null;

    return (
        <AnimatePresence>
            {(results || isAnalyzing) && (
                <motion.aside
                    initial={{ x: 380, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 380, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="absolute top-20 right-5 w-[360px] z-30 flex flex-col gap-3 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar"
                >
                    {isAnalyzing ? (
                        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#090b10]/80 backdrop-blur-2xl p-8 flex flex-col items-center justify-center text-center h-[480px]"
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.7), 0 0 100px rgba(102,252,241,0.05)' }}>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="ring-decoration w-64 h-64" style={{ animationDelay: '0s' }} />
                                <div className="ring-decoration w-48 h-48 absolute" style={{ animationDelay: '1s', borderColor: 'rgba(167,139,250,0.06)' }} />
                                <div className="ring-decoration w-32 h-32 absolute" style={{ animationDelay: '2s', borderColor: 'rgba(255,75,75,0.06)' }} />
                            </div>
                            <div className="relative w-28 h-28 mb-6">
                                <div className="absolute inset-0 border-2 border-[#66FCF1]/10 border-t-[#66FCF1] rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-3 border-2 border-[#A78BFA]/10 border-b-[#A78BFA] rounded-full animate-spin-reverse" style={{ animationDuration: '1.5s' }} />
                                <div className="absolute inset-6 border-2 border-[#FF4B4B]/10 border-t-[#FF4B4B] rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-[#66FCF1] shadow-[0_0_20px_rgba(102,252,241,0.8)] animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-[17px] font-black tracking-tight bg-gradient-to-r from-[#66FCF1] via-white to-[#A78BFA] bg-clip-text text-transparent mb-2">
                                Running Geophysics Engine
                            </h3>
                            <p className="text-[11px] text-white/30 leading-relaxed max-w-[200px]">
                                Pulling Sentinel 1 &amp; 2 mosaics...<br />Applying JRC &gt;80% masking
                            </p>
                            <p className="text-[9px] text-white/20 mt-4 font-mono">This may take 2–4 minutes</p>
                        </div>
                    ) : results ? (
                        <motion.div className="flex flex-col gap-3" initial="hidden" animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>

                            {/* ─── Model Warnings ─── */}
                            {results.model_warnings?.map((w, i) => (
                                <motion.div key={i} variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}
                                    className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#FF4B4B]/20 bg-[#FF4B4B]/[0.07] backdrop-blur-xl"
                                    style={{ boxShadow: '0 0 30px rgba(255,59,48,0.08)' }}>
                                    <ShieldAlert className="w-4 h-4 text-[#FF4B4B] shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-white/50 leading-relaxed">{w}</p>
                                </motion.div>
                            ))}

                            {/* ─── Main Panel ─── */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                                className="rounded-2xl border border-white/[0.05] bg-[#090b10]/75 backdrop-blur-2xl overflow-hidden"
                                style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.6)' }}>

                                {/* Header */}
                                <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between"
                                    style={{ background: 'linear-gradient(135deg, rgba(102,252,241,0.04) 0%, transparent 100%)' }}>
                                    <div>
                                        <h2 className="text-[13px] font-black tracking-wide text-white">Analysis Output</h2>
                                        <p className="text-[9px] text-white/30 mt-0.5 font-mono">{results.city}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${results.confidence_category === 'HIGH'
                                        ? 'bg-[#66FCF1]/10 text-[#66FCF1] border-[#66FCF1]/20'
                                        : results.confidence_category === 'MEDIUM'
                                            ? 'bg-[#facc15]/10 text-[#facc15] border-[#facc15]/20'
                                            : 'bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/20'
                                        }`}>
                                        {results.confidence_category}
                                    </span>
                                </div>

                                {/* Primary Flood Metrics */}
                                <div className="p-4 pb-2">
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Flood Analysis</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <MetricCard icon={<Droplets className="w-3.5 h-3.5 text-[#FF4B4B]" />} title="New Flood Delta"
                                            value={`${results.new_flood_area_km2.toFixed(3)}`} unit="km²"
                                            sub={`${results.flood_percentage.toFixed(2)}% of AOI`} color="#FF4B4B" />
                                        <MetricCard icon={<MapPin className="w-3.5 h-3.5 text-[#4ade80]" />} title="AOI Area"
                                            value={`${results.aoi_area_km2.toFixed(2)}`} unit="km²"
                                            sub={results.is_coastal ? '🌊 Coastal' : '🏔 Inland'} color="#4ade80" />
                                        <MetricCard icon={<Activity className="w-3.5 h-3.5 text-[#66FCF1]" />} title="Pre-Event Water"
                                            value={`${results.pre_water_area_km2.toFixed(3)}`} unit="km²"
                                            sub="Baseline (excl. permanent)" color="#66FCF1" />
                                        <MetricCard icon={<Waves className="w-3.5 h-3.5 text-[#facc15]" />} title="Post-Event Water"
                                            value={`${results.post_water_area_km2.toFixed(3)}`} unit="km²"
                                            sub="After event (excl. permanent)" color="#facc15" />
                                    </div>
                                </div>

                                {/* Core SAR Engine Metrics */}
                                <div className="px-4 pb-2 pt-1">
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Algorithm Diagnostics</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <MetricCard icon={<Activity className="w-3.5 h-3.5 text-[#fb923c]" />} title="Raw Water"
                                            value={`${results.raw_flood_area_km2.toFixed(3)}`} unit="km²"
                                            sub="Before Urban & Slope Filtering" color="#fb923c" />
                                        <MetricCard icon={<ShieldAlert className="w-3.5 h-3.5 text-[#10b981]" />} title="False Positives"
                                            value={`${results.false_positive_km2.toFixed(3)}`} unit="km²"
                                            sub="Filtered Out" color="#10b981" />
                                        <MetricCard icon={<BarChart3 className="w-3.5 h-3.5 text-[#94a3b8]" />} title="SAR Thresh"
                                            value={`${results.sar_threshold.toFixed(2)}`} unit="dB"
                                            sub="Adaptive VV Ceiling" color="#94a3b8" />
                                    </div>
                                </div>

                                {/* Hazard Exposure Context */}
                                <div className="px-4 pb-2 pt-1">
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Hazard Exposure Context</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <MetricCard icon={<Waves className="w-3.5 h-3.5 text-[#60a5fa]" />} title="Perm. Water"
                                            value={`${results.permanent_water_area_km2.toFixed(3)}`} unit="km²"
                                            sub="JRC >80% Occurrence Base" color="#60a5fa" />
                                        <MetricCard icon={<Activity className="w-3.5 h-3.5 text-[#facc15]" />} title="Pop. Affected"
                                            value={`${Math.round(results.flooded_pop).toLocaleString()}`} unit=""
                                            sub="WorldPop Est." color="#facc15" />
                                        <MetricCard icon={<MapPin className="w-3.5 h-3.5 text-[#c084fc]" />} title="Urban Area"
                                            value={`${results.flooded_urban_km2.toFixed(3)}`} unit="km²"
                                            sub="Flooded Built Surface" color="#c084fc" />
                                    </div>
                                </div>

                                {/* Confidence Score */}
                                <div className="px-4 pb-4 pt-1">
                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Geomatics Confidence Model</p>
                                    <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] text-white/40 uppercase tracking-wider">Score</span>
                                            <span className="text-[18px] font-black text-white">{(results.event_confidence_score * 100).toFixed(1)}<span className="text-[10px] text-white/30 ml-1">%</span></span>
                                        </div>
                                        {/* Score bar: 0–100% scale */}
                                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min(100, (results.event_confidence_score * 100) * 2)}%`,
                                                    background: results.confidence_category === 'HIGH'
                                                        ? 'linear-gradient(90deg, #66FCF1, #4ade80)'
                                                        : results.confidence_category === 'MEDIUM'
                                                            ? 'linear-gradient(90deg, #facc15, #fb923c)'
                                                            : 'linear-gradient(90deg, #FF4B4B, #fb923c)'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[8px] text-white/15">0 (LOW)</span>
                                            <span className="text-[8px] text-white/15">2 (HIGH)</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ─── Date Report ─── */}
                            {results.date_report && (
                                <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                                    className="rounded-xl border border-white/[0.05] bg-[#090b10]/75 backdrop-blur-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/[0.04]"
                                        style={{ background: 'linear-gradient(135deg, rgba(102,252,241,0.03) 0%, transparent 100%)' }}>
                                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em]">Scene Availability</p>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <DateRow
                                            label="Pre-Event"
                                            window={results.date_report.pre_window}
                                            s2={results.date_report.s2_pre_count}
                                            s1={results.date_report.s1_pre_count}
                                            color="#66FCF1"
                                        />
                                        <DateRow
                                            label="Post-Event"
                                            window={results.date_report.post_window}
                                            s2={results.date_report.s2_post_count}
                                            s1={results.date_report.s1_post_count}
                                            color="#FF4B4B"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── XGBoost Forecast Placeholder ─── */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                                className="rounded-xl border border-white/[0.04] overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, rgba(102,252,241,0.04) 0%, rgba(167,139,250,0.04) 100%)' }}>
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                                            <TrendingUp className="w-2.5 h-2.5" />
                                            Risk Forecast (Next 5 Days)
                                        </div>
                                        <div className="text-[11px] text-white/40 font-mono">
                                            {results.flood_percentage > 10
                                                ? 'Elevated risk — monitor upstream discharge'
                                                : results.flood_percentage > 3
                                                    ? 'Moderate risk — watch satellite revisits'
                                                    : 'Low risk — normal seasonal variation'}
                                        </div>
                                    </div>
                                    <div className="relative ml-4 shrink-0">
                                        <Radar className="w-10 h-10 text-[#66FCF1]/20 animate-spin" style={{ animationDuration: '8s' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#66FCF1]/50 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>
                    ) : null}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}

function MetricCard({ icon, title, value, unit, sub, color }: {
    icon: React.ReactNode; title: string; value: string;
    unit: string; sub: string; color: string;
}) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col gap-1 p-3 rounded-xl border border-white/[0.04] bg-white/[0.025] hover:bg-white/[0.04] transition-all group cursor-default relative overflow-hidden"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle at 0% 0%, ${color}0a 0%, transparent 60%)` }} />
            <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-[8px] uppercase font-bold tracking-[0.12em] text-white/25">{title}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-[17px] font-black text-white leading-none">{value}</span>
                {unit && <span className="text-[10px] font-bold text-white/30">{unit}</span>}
            </div>
            <div className="text-[8px] text-white/25 leading-tight">{sub}</div>
        </motion.div>
    );
}

function DateRow({ label, window: win, s2, s1, color }: {
    label: string; window: string; s2: number; s1: number; color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
            <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{label}</div>
                <div className="text-[8px] text-white/20 font-mono truncate">{win}</div>
            </div>
            <div className="flex gap-2 shrink-0">
                <SceneBadge label="S2" count={s2} />
                <SceneBadge label="S1" count={s1} />
            </div>
        </div>
    );
}

function SceneBadge({ label, count }: { label: string, count: number }) {
    const hasData = count > 0;
    return (
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold border ${hasData ? 'text-[#4ade80] border-[#4ade80]/20 bg-[#4ade80]/[0.08]' : 'text-[#FF4B4B] border-[#FF4B4B]/15 bg-[#FF4B4B]/[0.06]'
            }`}>
            {label}
            <span className="font-black">{count}</span>
        </div>
    );
}
