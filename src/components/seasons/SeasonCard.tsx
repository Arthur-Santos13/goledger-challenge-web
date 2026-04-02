'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Season } from '@/types';
import { useEpisodesBySeason } from '@/hooks/useEpisodes';
import Button from '@/components/ui/Button';

interface SeasonCardProps {
    season: Season;
    tvShowTitle: string;
    onEdit: (season: Season) => void;
    onDelete: (season: Season) => void;
    onAvgRatingReady?: (seasonKey: string, avg: number | null) => void;
}

export default function SeasonCard({ season, tvShowTitle, onEdit, onDelete, onAvgRatingReady }: SeasonCardProps) {
    const { episodes } = useEpisodesBySeason(season['@key'], season.number, tvShowTitle);

    const ratedEpisodes = episodes.filter((e) => e.rating != null);
    const avgRating =
        ratedEpisodes.length > 0
            ? ratedEpisodes.reduce((sum, e) => sum + (e.rating ?? 0), 0) / ratedEpisodes.length
            : null;

    useEffect(() => {
        if (onAvgRatingReady) onAvgRatingReady(season['@key'], avgRating);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avgRating, season['@key']]);

    return (
        <div className="group relative bg-[#1f1f1f] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#808080] transition-all duration-200">
            {/* Top bar */}
            <div className="h-2 bg-gradient-to-r from-[#7C3AED] to-[#5B21B6]" />

            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                        <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                            Temporada
                        </span>
                        <h3 className="text-2xl font-bold text-white leading-none mt-0.5">
                            {season.number}
                        </h3>
                    </div>
                    <span className="text-[#b3b3b3] text-sm font-medium bg-[#2a2a2a] px-2 py-1 rounded">
                        {season.year}
                    </span>
                </div>

                <p className="text-[#808080] text-xs truncate mb-3">{tvShowTitle}</p>

                {/* Avg rating */}
                <div className="flex items-center gap-1.5 mb-4">
                    <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">
                        {avgRating != null ? avgRating.toFixed(1) : '–'}
                    </span>
                    <span className="text-xs text-[#808080]">/ 10</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Link
                        href={`/tv-shows/${encodeURIComponent(tvShowTitle)}/seasons/${season.number}`}
                        className="flex-1 text-center text-xs font-medium bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded py-1.5 transition-colors"
                    >
                        Ver episódios
                    </Link>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(season)}
                        aria-label="Editar temporada"
                        className="p-1.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(season)}
                        aria-label="Excluir temporada"
                        className="p-1.5 hover:text-[#7C3AED]"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
}
