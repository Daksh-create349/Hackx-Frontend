import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TerminalLog({ logs, isAnalyzing }: { logs: string[], isAnalyzing: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <motion.div
            initial={{ y: 180, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 22 }}
            className="absolute bottom-6 left-6 w-[440px] z-30 rounded-2xl overflow-hidden border border-white/[0.05]"
            style={{
                background: 'rgba(6, 8, 14, 0.85)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(102,252,241,0.03)'
            }}
        >
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]"
                style={{ background: 'linear-gradient(90deg, rgba(102,252,241,0.04) 0%, transparent 60%)' }}>
                <div className="flex items-center gap-2.5">
                    <Terminal className="w-3.5 h-3.5 text-[#66FCF1]/60" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        System Audit Log
                    </span>
                    {isAnalyzing && (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-[#FF4B4B]/70 uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-[#FF4B4B] animate-pulse inline-block" />
                            Live
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF4B4B]/40 hover:bg-[#FF4B4B]/60 transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-[#facc15]/40 hover:bg-[#facc15]/60 transition-colors" />
                    <div className="w-2 h-2 rounded-full bg-[#4ade80]/40 hover:bg-[#4ade80]/60 transition-colors" />
                </div>
            </div>

            {/* Log lines */}
            <div ref={containerRef} className="h-44 p-4 overflow-y-auto space-y-1 custom-scrollbar">
                {logs.map((log, i) => {
                    const isError = log.includes('WARNING') || log.includes('ERROR');
                    const isSuccess = log.includes('DONE') || log.includes('OK') || log.includes('SUCCESS');
                    const isHeader = log.startsWith('>');
                    const time = new Date().toISOString().split('T')[1].split('.')[0];

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-2.5 group"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                            <span className="text-[9px] text-white/15 shrink-0 mt-0.5 tabular-nums">[{time}]</span>
                            <span className={`text-[11px] leading-relaxed ${isError
                                ? 'text-[#FF4B4B]'
                                : isSuccess
                                    ? 'text-[#4ade80]'
                                    : isHeader
                                        ? 'text-[#66FCF1]/70'
                                        : 'text-white/30'
                                }`}>
                                {log}
                            </span>
                        </motion.div>
                    );
                })}

                {isAnalyzing && (
                    <div className="flex items-center gap-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        <span className="text-[9px] text-white/15 shrink-0" />
                        <span className="text-[11px] text-[#66FCF1]/50 animate-pulse">▋</span>
                    </div>
                )}
            </div>

            {/* Bottom progress bar when analyzing */}
            {isAnalyzing && (
                <div className="h-[2px] w-full bg-white/[0.04]">
                    <div className="h-full bg-gradient-to-r from-[#66FCF1]/0 via-[#66FCF1] to-[#66FCF1]/0 animate-shimmer" style={{ width: '40%' }} />
                </div>
            )}
        </motion.div>
    );
}
