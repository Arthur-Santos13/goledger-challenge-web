'use client';

import type { Watchlist } from '@/types';
import Button from '@/components/ui/Button';

interface WatchlistCardProps {
    watchlist: Watchlist;
    tvShowTitleByKey: Record<string, string>;
    onEdit: (watchlist: Watchlist) => void;
    onDelete: (watchlist: Watchlist) => void;
}

export default function WatchlistCard({ watchlist, tvShowTitleByKey, onEdit, onDelete }: WatchlistCardProps) {
    const tvShowCount = watchlist.tvShows?.length ?? 0;

    return (
        <div className="group bg-[#1f1f1f] rounded-lg border border-[#2a2a2a] hover:border-[#808080] transition-all duration-200 p-5">
            <div className="flex items-start justify-between gap-3">
                {/* Icon + title */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{watchlist.title}</h3>
                        <p className="text-[#808080] text-xs mt-0.5">
                            {tvShowCount} {tvShowCount === 1 ? 'série' : 'séries'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(watchlist)}
                        aria-label="Editar watchlist"
                        className="p-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(watchlist)}
                        aria-label="Excluir watchlist"
                        className="p-1.5 hover:text-[#7C3AED]"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                </div>
            </div>

            {watchlist.description && (
                <p className="text-[#808080] text-sm mt-3 line-clamp-2">{watchlist.description}</p>
            )}

            {/* TV Shows list */}
            {tvShowCount > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {watchlist.tvShows!.map((ts) => (
                        <span
                            key={ts['@key']}
                            className="text-xs bg-[#2a2a2a] text-[#d4d4d4] border border-[#333] px-2 py-0.5 rounded-full"
                        >
                            {tvShowTitleByKey[ts['@key']] ?? ts['@key'].split(':')[1]?.slice(0, 8)}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
