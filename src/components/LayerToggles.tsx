import { Layers, MapPin, Waves, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const layers = [
    { id: 'admin', label: 'Admin Boundary', icon: <MapPin className="w-4 h-4" /> },
    { id: 'perm', label: 'Permanent Water', icon: <Waves className="w-4 h-4" /> },
    { id: 'flood', label: 'New Flood Delta', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'sar', label: 'SAR Detections', icon: <RadarIcon className="w-4 h-4" /> },
    { id: 'optical', label: 'Optical Detections', icon: <Layers className="w-4 h-4" /> },
];

export default function LayerToggles({ activeLayer, onLayerChange }: { activeLayer: string, onLayerChange: (id: string) => void }) {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel px-2 py-2 flex items-center gap-2 z-40"
        >
            {layers.map((layer) => {
                const isActive = activeLayer === layer.id;
                return (
                    <button
                        key={layer.id}
                        onClick={() => onLayerChange(layer.id)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${isActive
                                ? 'bg-brand-cyan text-brand-dark shadow-[0_0_15px_rgba(102,252,241,0.4)]'
                                : 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white'}
            `}
                    >
                        {layer.icon}
                        {layer.label}
                    </button>
                );
            })}
        </motion.div>
    );
}

function RadarIcon(props: any) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
            <path d="M4 6h.01" />
            <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
            <path d="M16.24 7.76A6 6 0 1 0 8.25 16.23" />
            <path d="M12 18h.01" />
            <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
            <circle cx="12" cy="12" r="2" />
            <line x1="12" y1="12" x2="16.24" y2="7.76" />
        </svg>
    );
}
