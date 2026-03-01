import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

const LAYER_OPTIONS = [
    { id: 'admin', label: 'Admin Boundary', color: '#4ade80' },
    { id: 'perm', label: 'Permanent Water', color: '#60a5fa', icon: '🌊' },
    { id: 'pre', label: 'Pre-Event Water', color: '#818cf8' },
    { id: 'post', label: 'Post-Event Water', color: '#facc15' },
    { id: 'flood', label: 'Flood Delta', color: '#FF4B4B' },
    { id: 'sar', label: 'SAR Detections', color: '#94a3b8' },
    { id: 'optical', label: 'Optical Detections', color: '#67e8f9' },
    { id: 'heatmap', label: 'Confidence Heatmap', color: '#fbbf24' },
];

export default function LayerPanel({ activeLayers, toggleLayer }: { activeLayers: string[], toggleLayer: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const activeCount = activeLayers.length;

    return (
        <div className="absolute bottom-8 right-8 z-40">
            {/* Expanded Panel */}
            {isOpen && (
                <div className="mb-2 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 overflow-hidden w-[220px] animate-fadeIn">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em]">Map Layers</p>
                    </div>
                    <div className="p-2 space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {LAYER_OPTIONS.map(layer => {
                            const isActive = activeLayers.includes(layer.id);
                            return (
                                <button
                                    key={layer.id}
                                    onClick={() => toggleLayer(layer.id)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 ${isActive
                                        ? 'bg-white/[0.08] text-white'
                                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                                        }`}
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                                        style={{
                                            backgroundColor: isActive ? layer.color : 'transparent',
                                            border: `2px solid ${isActive ? layer.color : 'rgba(255,255,255,0.15)'}`,
                                            boxShadow: isActive ? `0 0 8px ${layer.color}40` : 'none',
                                        }}
                                    />
                                    <span className="text-[11px] font-medium tracking-wide">{layer.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-2.5 shadow-lg hover:border-[#66FCF1]/30 transition-all group"
            >
                <Layers className="w-4 h-4 text-[#66FCF1] group-hover:text-[#66FCF1]" />
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider group-hover:text-white/80">
                    Layers
                </span>
                {activeCount > 0 && (
                    <span className="text-[9px] font-bold bg-[#66FCF1]/20 text-[#66FCF1] px-1.5 py-0.5 rounded-full">
                        {activeCount}
                    </span>
                )}
                {isOpen ? <ChevronDown className="w-3 h-3 text-white/30" /> : <ChevronUp className="w-3 h-3 text-white/30" />}
            </button>
        </div>
    );
}
