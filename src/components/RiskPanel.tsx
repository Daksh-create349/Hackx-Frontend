import { useState } from 'react';
import { type RiskResult } from '../services/api';

const CAT_COLORS: Record<string, string> = {
    LOW:      '#66FCF1',
    MEDIUM:   '#facc15',
    HIGH:     '#fb923c',
    CRITICAL: '#FF4B4B',
};

const CAT_BG: Record<string, string> = {
    LOW:      'bg-[#66FCF1]/10 border-[#66FCF1]/20 text-[#66FCF1]',
    MEDIUM:   'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    HIGH:     'bg-orange-400/10 border-orange-400/20 text-orange-400',
    CRITICAL: 'bg-[#FF4B4B]/10 border-[#FF4B4B]/20 text-[#FF4B4B]',
};

function FactorBar({ label, value, weight, color }: {
    label: string; value: number; weight: number; color: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/25">w={weight}%</span>
                    <span className="text-[10px] font-bold" style={{ color }}>{value.toFixed(1)}%</span>
                </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        width: `${Math.min(100, value)}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}88`,
                    }}
                />
            </div>
        </div>
    );
}

export default function RiskPanel({ onAssess, isAssessing, riskResult, cityName }: {
    onAssess: () => void;
    isAssessing: boolean;
    riskResult: RiskResult | null;
    cityName: string;
}) {
    const [expanded, setExpanded] = useState(true);

    const cat = riskResult?.risk_category || 'LOW';
    const catColor = CAT_COLORS[cat] || '#66FCF1';

    return (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0c12]/95 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-4 pt-4 pb-3 border-b border-white/[0.04] flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: catColor, boxShadow: `0 0 6px ${catColor}` }}
                    />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        ⚠ Flood Risk Assessment
                    </span>
                </div>
                {riskResult && (
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CAT_BG[cat]}`}>
                        {cat}
                    </span>
                )}
            </button>

            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Score gauge */}
                    {riskResult && (
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                                    <circle
                                        cx="40" cy="40" r="32" fill="none"
                                        stroke={catColor} strokeWidth="7"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(riskResult.risk_score_pct / 100) * Math.PI * 64} ${Math.PI * 64}`}
                                        style={{ filter: `drop-shadow(0 0 6px ${catColor}88)`, transition: 'stroke-dasharray 1s ease' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-black text-white">
                                        {riskResult.risk_score_pct.toFixed(0)}<span className="text-[9px] text-white/40">%</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                    <div className="text-[11px] font-black text-white">{riskResult.at_risk_area_km2} km²</div>
                                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-wide mt-0.5">At-Risk Area</div>
                                </div>
                                <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                    <div className="text-[11px] font-black text-white">{Math.round(riskResult.at_risk_pop).toLocaleString()}</div>
                                    <div className="text-[8px] font-bold text-white/30 uppercase tracking-wide mt-0.5">Pop. at Risk</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4-Factor breakdown */}
                    {riskResult && (
                        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Factor Breakdown</span>
                            <FactorBar label="Historical Frequency" value={riskResult.factor_history}   weight={40} color="#FF4B4B" />
                            <FactorBar label="Elevation Risk"       value={riskResult.factor_elevation} weight={25} color="#fb923c" />
                            <FactorBar label="Rainfall Anomaly"     value={riskResult.factor_rainfall}  weight={20} color="#818cf8" />
                            <FactorBar label="Water Proximity"      value={riskResult.factor_proximity} weight={15} color="#66FCF1" />
                        </div>
                    )}

                    {/* Assess button */}
                    {!riskResult && !isAssessing && cityName && (
                        <button
                            onClick={onAssess}
                            className="w-full py-2.5 rounded-xl font-bold text-[11px] tracking-widest uppercase bg-gradient-to-r from-[#fb923c] to-[#facc15] text-[#090b10] hover:shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:-translate-y-0.5 transition-all"
                        >
                            ⚠ Assess Risk Now
                        </button>
                    )}

                    {isAssessing && (
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="w-7 h-7 border-2 border-[#fb923c]/40 border-t-[#fb923c] rounded-full animate-spin" />
                            <span className="text-[10px] text-white/40 font-mono">Computing 4-factor risk score...</span>
                        </div>
                    )}

                    {riskResult && (
                        <button
                            onClick={onAssess}
                            disabled={isAssessing}
                            className="w-full py-2 rounded-xl font-bold text-[10px] tracking-widest uppercase border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/10 transition-all"
                        >
                            ↺ Re-assess
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
