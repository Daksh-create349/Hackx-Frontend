import { useState } from 'react';
import { Play, Search, Calendar, ChevronDown, ChevronUp, MapPin, Zap, Shield, Radio } from 'lucide-react';

interface QuickRegion {
    name: string;
    label: string;
    preStart: string;
    preEnd: string;
    postStart: string;
    postEnd: string;
}

const QUICK_REGIONS: QuickRegion[] = [
    { name: 'Thrissur, Kerala, India', label: 'Thrissur (2018)', preStart: '2018-04-01', preEnd: '2018-05-31', postStart: '2018-08-01', postEnd: '2018-09-30' },
    { name: 'Assam, India', label: 'Assam (Jul-Aug)', preStart: '2020-05-01', preEnd: '2020-06-30', postStart: '2020-07-20', postEnd: '2020-09-15' },
    { name: 'Hyderabad, India', label: 'Andhra/Hyd (Aug 24)', preStart: '2000-06-01', preEnd: '2000-07-31', postStart: '2000-08-23', postEnd: '2000-09-30' },
    { name: 'West Bengal, India', label: 'W. Bengal (Sep 17-22)', preStart: '2000-07-01', preEnd: '2000-08-31', postStart: '2000-09-17', postEnd: '2000-10-31' },
    { name: 'Bihar, India', label: 'Bihar (Sep)', preStart: '2000-07-01', preEnd: '2000-08-31', postStart: '2000-09-01', postEnd: '2000-10-31' },
    { name: 'Himachal Pradesh, India', label: 'Himachal (Aug)', preStart: '2000-06-01', preEnd: '2000-07-31', postStart: '2000-08-01', postEnd: '2000-09-30' },
    { name: 'Mumbai, India', label: 'Maharashtra (Jul 12)', preStart: '2000-05-01', preEnd: '2000-06-30', postStart: '2000-07-12', postEnd: '2000-08-30' }
];

export default function CommandSidebar({ onAnalyze, isAnalyzing, backendOnline, onForecast, isForecasting }: {
    onAnalyze: (city: string, preStart: string, preEnd: string, postStart: string, postEnd: string) => void;
    isAnalyzing: boolean;
    backendOnline: boolean | null;
    onForecast: (city: string) => void;
    isForecasting: boolean;
}) {
    const [targetCity, setTargetCity] = useState('Pune, India');
    const [preStart, setPreStart] = useState('2024-04-01');
    const [preEnd, setPreEnd] = useState('2024-05-31');
    const [postStart, setPostStart] = useState('2024-07-01');
    const [postEnd, setPostEnd] = useState('2024-08-31');
    const [showDates, setShowDates] = useState(false);

    return (
        <aside className="w-[280px] h-full bg-[#0a0c12] border-r border-white/[0.04] flex flex-col z-30 relative overflow-hidden">

            {/* Decorative glow blob */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#66FCF1]/[0.04] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-56 h-56 bg-[#FF4B4B]/[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* App Logo & Brand */}
            <div className="px-5 pt-6 pb-4 border-b border-white/[0.04] relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66FCF1] to-[#45A29E] flex items-center justify-center shadow-[0_0_24px_rgba(102,252,241,0.25)] relative">
                        <span className="text-[15px] font-black text-[#0a0c12]">A</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <div>
                        <h1 className="text-[16px] font-black tracking-[0.2em] text-white leading-none">AQUILA</h1>
                        <p className="text-[8px] text-[#66FCF1]/50 font-semibold tracking-[0.18em] mt-1">CLIMATE INTELLIGENCE</p>
                    </div>
                </div>
                <p className="text-[9px] text-white/20 mt-3 leading-relaxed">
                    Satellite-based flood detection using Sentinel-1/2 + JRC permanent water masking
                </p>
            </div>

            {/* Search */}
            <div className="px-5 pt-5 pb-2 relative">
                <label className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-2 block">Target Region</label>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-[#66FCF1]/60 transition-colors" />
                    <input
                        type="text"
                        value={targetCity}
                        onChange={e => setTargetCity(e.target.value)}
                        placeholder="Search city or region..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder-white/15 focus:outline-none focus:border-[#66FCF1]/30 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(102,252,241,0.08)] transition-all"
                    />
                </div>

                {/* Quick region chips - Scrollable list */}
                <div className="flex flex-col gap-1.5 mt-3 max-h-[140px] overflow-y-auto pr-1 pb-1 custom-scrollbar">
                    {QUICK_REGIONS.map(region => (
                        <button
                            key={region.name}
                            onClick={() => {
                                setTargetCity(region.name);
                                setPreStart(region.preStart);
                                setPreEnd(region.preEnd);
                                setPostStart(region.postStart);
                                setPostEnd(region.postEnd);
                                setShowDates(true); // Open the dates panel so they can see the change
                            }}
                            className={`flex flex-col w-full text-left items-start px-3 py-2 rounded-lg border transition-all ${targetCity === region.name
                                ? 'bg-[#66FCF1]/10 border-[#66FCF1]/30 text-[#66FCF1]'
                                : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.04] hover:border-white/20'
                                }`}
                        >
                            <span className="text-[10px] font-bold tracking-wide">{region.label}</span>
                            <span className="text-[9px] opacity-50 font-mono mt-1 tracking-widest">{region.postStart} to {region.postEnd}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-3" />

            {/* Date Windows — Collapsible */}
            <div className="px-5">
                <button
                    onClick={() => setShowDates(!showDates)}
                    className="flex items-center justify-between w-full text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] py-2 hover:text-white/40 transition-colors"
                >
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Event Windows
                    </div>
                    {showDates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showDates && (
                    <div className="space-y-3 pb-3 animate-fadeIn">
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <label className="text-[9px] font-bold text-[#66FCF1]/50 uppercase tracking-[0.15em] mb-2 block flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-[#66FCF1]" />
                                Pre-Event
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={preStart} onChange={e => setPreStart(e.target.value)}
                                    className="bg-black/40 border border-white/[0.06] rounded px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-[#66FCF1]/30 transition-all" />
                                <input type="date" value={preEnd} onChange={e => setPreEnd(e.target.value)}
                                    className="bg-black/40 border border-white/[0.06] rounded px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-[#66FCF1]/30 transition-all" />
                            </div>
                        </div>
                        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                            <label className="text-[9px] font-bold text-[#FF4B4B]/50 uppercase tracking-[0.15em] mb-2 block flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-[#FF4B4B]" />
                                Post-Event
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={postStart} onChange={e => setPostStart(e.target.value)}
                                    className="bg-black/40 border border-white/[0.06] rounded px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-[#FF4B4B]/30 transition-all" />
                                <input type="date" value={postEnd} onChange={e => setPostEnd(e.target.value)}
                                    className="bg-black/40 border border-white/[0.06] rounded px-2 py-1.5 text-[10px] text-white/60 focus:outline-none focus:border-[#FF4B4B]/30 transition-all" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent my-2" />

            {/* Engine Capabilities */}
            <div className="px-5 py-3">
                <label className="text-[9px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3 block">Engine Capabilities</label>
                <div className="grid grid-cols-2 gap-2">
                    <CapabilityChip icon={<MapPin className="w-3 h-3" />} label="GAUL L2" />
                    <CapabilityChip icon={<Zap className="w-3 h-3" />} label="XGBoost" />
                    <CapabilityChip icon={<Shield className="w-3 h-3" />} label="Otsu Threshold" />
                    <CapabilityChip icon={<Radio className="w-3 h-3" />} label="SAR + Optical" />
                </div>
            </div>

            <div className="flex-1" />

            {/* System Status */}
            <div className="px-5 pb-2">
                <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-white/25 uppercase tracking-[0.15em]">System</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isAnalyzing
                                ? 'bg-[#FF4B4B] animate-pulse shadow-[0_0_6px_rgba(255,75,75,0.6)]'
                                : 'bg-[#66FCF1] shadow-[0_0_6px_rgba(102,252,241,0.4)]'
                                }`} />
                            <span className="text-[9px] font-mono text-white/30">
                                {isAnalyzing ? 'ACTIVE' : 'READY'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3 text-[9px] text-white/20 mb-2">
                        <span>Sentinel-1 ✓</span>
                        <span>Sentinel-2 ✓</span>
                        <span>JRC ✓</span>
                    </div>
                    {/* Backend connectivity */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.04]">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${backendOnline === null
                            ? 'bg-white/20 animate-pulse'
                            : backendOnline
                                ? 'bg-[#4ade80] shadow-[0_0_5px_rgba(74,222,128,0.5)]'
                                : 'bg-yellow-400 animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.5)]'
                            }`} />
                        <span className="text-[8px] font-mono text-white/25 uppercase tracking-wider">
                            {backendOnline === null ? 'Connecting...' : backendOnline ? 'API :8000 online' : 'API :8000 offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 7-Day Flood Forecast Button */}
            <div className="px-5 pb-2">
                <button
                    onClick={() => onForecast(targetCity)}
                    disabled={isForecasting || isAnalyzing}
                    className={`w-full py-2.5 rounded-xl font-bold text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden ${
                        isForecasting
                            ? 'bg-white/[0.04] cursor-not-allowed text-white/30 border border-white/[0.06]'
                            : 'bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white hover:shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5'
                    }`}
                >
                    {isForecasting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/15 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                        <span className="text-sm">📅</span>
                    )}
                    {isForecasting ? 'Forecasting...' : '7-Day Flood Forecast'}
                </button>
            </div>

            {/* Run Button */}
            <div className="px-5 pb-5 pt-1">
                <button
                    onClick={() => onAnalyze(targetCity, preStart, preEnd, postStart, postEnd)}
                    disabled={isAnalyzing}
                    className={`w-full py-3 rounded-xl font-bold text-[11px] tracking-[0.12em] uppercase flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden ${isAnalyzing
                        ? 'bg-white/[0.04] cursor-not-allowed text-white/30 border border-white/[0.06]'
                        : 'bg-gradient-to-r from-[#FF4B4B] to-[#FF6B3D] text-white hover:shadow-[0_4px_30px_rgba(255,75,75,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_2px_15px_rgba(255,75,75,0.3)]'
                        }`}
                >
                    {!isAnalyzing && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full animate-shimmer" />}
                    {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-white/15 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                        <Play className="w-3.5 h-3.5 fill-white" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Run Pipeline'}
                </button>
            </div>
        </aside>
    );
}

function CapabilityChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] rounded-md px-2.5 py-1.5 group hover:border-white/[0.08] transition-all">
            <span className="text-white/15 group-hover:text-[#66FCF1]/40 transition-colors">{icon}</span>
            <span className="text-[9px] font-medium text-white/20 group-hover:text-white/35 tracking-wider transition-colors">{label}</span>
        </div>
    );
}
