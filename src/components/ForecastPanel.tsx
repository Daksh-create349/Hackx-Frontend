import { type ForecastResult } from '../services/api';

const CAT_COLORS: Record<string, string> = {
    LOW:      '#66FCF1',
    MODERATE: '#facc15',
    HIGH:     '#fb923c',
    CRITICAL: '#FF4B4B',
};

const CAT_BG: Record<string, string> = {
    LOW:      'bg-[#66FCF1]/10 border-[#66FCF1]/20 text-[#66FCF1]',
    MODERATE: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    HIGH:     'bg-orange-400/10 border-orange-400/20 text-orange-400',
    CRITICAL: 'bg-[#FF4B4B]/10 border-[#FF4B4B]/20 text-[#FF4B4B]',
};

function Dial({ value, label, color }: { value: number; label: string; color: string }) {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 88 88">
                    <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                    <circle
                        cx="44" cy="44" r={r} fill="none"
                        stroke={color} strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ}`}
                        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}88)` }}
                    />
                </svg>
                <span className="text-xl font-black text-white">{value}<span className="text-xs font-bold text-white/40">%</span></span>
            </div>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">{label}</span>
        </div>
    );
}

function BiasBar({ label, sub, value, max = 20 }: { label: string; sub: string; value: number; max?: number }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                    <span className="text-[9px] font-bold text-white/60 truncate">{label}</span>
                    <span className="text-[9px] font-mono text-[#66FCF1]/70 ml-1 shrink-0">+{value.toFixed(1)}%</span>
                </div>
                <div className="text-[8px] text-white/25 font-mono mb-1 truncate">{sub}</div>
                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-[#66FCF1]"
                        style={{ width: `${pct}%`, boxShadow: '0 0 6px #66FCF188', transition: 'width 0.8s ease' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ForecastPanel({ result, isForecasting }: {
    result: ForecastResult | null;
    isForecasting: boolean;
}) {
    if (isForecasting) {
        return (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0c12]/95 backdrop-blur-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">7-Day Forecast</span>
                </div>
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-8 h-8 border-2 border-[#818cf8]/40 border-t-[#818cf8] rounded-full animate-spin" />
                    <span className="text-[10px] text-white/40 font-mono">Running OLS regression...</span>
                    <span className="text-[9px] text-white/20 font-mono">Querying last 20 days of S1 passes...</span>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const cat = result.risk_category || 'LOW';
    const catColor = CAT_COLORS[cat] || '#66FCF1';
    const { bias_breakdown: b, historical_signals: hist } = result;

    const trendSlope = result.trend_slope ?? 0;
    const trendLabel = trendSlope > 0.0005 ? '📈 Worsening trend' : trendSlope < -0.0005 ? '📉 Improving trend' : '➖ Stable trend';
    const trendColor = trendSlope > 0.0005 ? '#FF4B4B' : trendSlope < -0.0005 ? '#66FCF1' : '#facc15';

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0c12]/95 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }} />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">📅 7-Day Flood Forecast</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_BG[cat]}`}>
                        {cat}
                    </span>
                </div>
                <p className="text-[11px] font-bold text-white/60 truncate">{result.city}</p>
            </div>

            <div className="p-4 space-y-4">
                {/* Probability dials */}
                <div className="flex justify-around">
                    <Dial value={result.flood_probability_pct} label="Flood Probability" color={catColor} />
                    <Dial value={result.rain_probability_pct} label="Rain Probability" color="#818cf8" />
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Expected Rain', value: `${result.expected_rain_7d_mm.toFixed(0)} mm`, sub: '7-day total' },
                        { label: 'At-Risk Area', value: `${result.at_risk_area_km2} km²`, sub: 'High-risk zone' },
                        { label: 'Pop. at Risk', value: Math.round(result.at_risk_pop).toLocaleString(), sub: 'Estimated' },
                    ].map(m => (
                        <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                            <div className="text-[11px] font-black text-white">{m.value}</div>
                            <div className="text-[8px] font-bold text-white/30 uppercase tracking-wide mt-0.5">{m.label}</div>
                            <div className="text-[7px] text-white/20">{m.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Trend */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: trendColor }}>{trendLabel}</span>
                    <span className="text-[9px] font-mono text-white/30">slope={result.trend_slope?.toFixed(5)}</span>
                </div>

                {/* Bias breakdown */}
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/[0.04] flex items-center gap-2">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Algorithm Bias Breakdown</span>
                    </div>
                    <div className="p-3 space-y-2.5">
                        <BiasBar label="SAR Regression" sub="(OLS recent passes)" value={b.regression_contrib_pct} max={50} />
                        <BiasBar label="Elevation bias" sub="(DEM w=0.15)" value={b.elevation_bias_pct} max={15} />
                        <BiasBar label="Rainfall bias" sub="(CHIRPS w=0.20)" value={b.rainfall_bias_pct} max={20} />
                        <BiasBar label="Proximity bias" sub="(JRC w=0.10)" value={b.proximity_bias_pct} max={10} />
                        <BiasBar label="Soil saturation" sub="(30-day w=0.05)" value={b.soil_bias_pct} max={5} />
                    </div>
                </div>

                {/* Historical signals table */}
                {hist && hist.length > 0 && (
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/[0.04]">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Recent S1 Passes (Regression Input)</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {hist.map(s => (
                                <div key={s.date} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                                    <span className="text-[9px] font-bold text-white/40 font-mono">{s.date}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[8px] text-[#FF4B4B]/60">
                                            Flood: {(s.flood_frac * 100).toFixed(1)}%
                                        </span>
                                        <span className="text-[8px] text-[#818cf8]/60">
                                            Rain: {s.rain_mm.toFixed(1)} mm/d
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
