'use client'

import StatusBadge from "./StatusBadge"

function HealthScoreRing({ score }){
    if(score === null || score === undefined){
        return (
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-4 border-slate-700 flex items-center justify-center">
                    <span className="text-slate-500 text-xs font-bold">-</span>
                </div>
                <span className="text-slate-500 text-xs mt-1">Score</span>
            </div>
        )
    }

    const color = score >= 75 ? '#34d399' : score >= 25 ? '#fbbf24' : '#f87171';
    const circumference = 2 * Math.PI * 20;
    const dashOffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="20" fill="none" stroke="#334155" strokeWidth="5"/>
                <circle cx="28" cy="28" r="20" fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 28 28)" style={{transition: 'stroke-dashoffset 0.5s ease'}}/>
                <text x="28" y="33" textAnchor="middle" fill={color} fontSize="12" fontWeight="700">{score}</text>
            </svg>
            <span className="text-slate-500 text-xs mt-1">Score</span>
        </div>
    )
}

function formatTimestamp(ts){
    if(!ts) return 'Never';
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

export default function ServiceCard({ service, onRefresh, onDelete, isRefreshing }){
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-white font-semibold text-base truncate">{service.name}</h3>
                    <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 text-xs truncate block hover:text-slate-300 transition-colors max-w-xs">{service.url}</a>
                </div>
                <StatusBadge status={service.status} />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-6">
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Latency</p>
                        <p className="text-white font-mono text-sm font-semibold">
                            {service.latencyMs !== null ? `${service.latencyMs} ms` : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs mb-0.5">Last Checked</p>
                        <p className="text-slate-300 text-xs">{formatTimestamp(service.lastCheckedAt)}</p>
                    </div>
                </div>
                <HealthScoreRing score={service.healthScore} />
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-700/60">
                <button onClick={() => onRefresh(service.id)} disabled={isRefreshing} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-slate-300 text-sm font-medium transition-colors">
                    <svg className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isRefreshing ? 'Checking..' : 'Refresh'}
                </button>
                <button onClick={() => onDelete(service.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 text-sm font-medium transition-colors">
                    Delete
                </button>
            </div>
        </div>
    )
}