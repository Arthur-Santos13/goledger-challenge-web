'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { TvShow } from '@/types';
import { getPoster, setPoster } from '@/lib/posterCache';
import { searchTvShow, posterUrl } from '@/lib/tmdb';
import Button from '@/components/ui/Button';

function ageBadgeStyle(age: number): { bg: string; label: string } {
    if (age >= 18) return { bg: 'bg-[#1a1a1a] border border-white/40', label: '18' };
    if (age >= 16) return { bg: 'bg-red-600', label: '16' };
    if (age >= 14) return { bg: 'bg-orange-500', label: '14' };
    if (age >= 12) return { bg: 'bg-yellow-500', label: '12' };
    if (age >= 10) return { bg: 'bg-sky-400', label: '10' };
    return { bg: 'bg-green-600', label: 'L' };
}

interface TvShowCardProps {
    tvShow: TvShow;
    avgRating: number | null;
    onEdit: (tvShow: TvShow) => void;
    onDelete: (tvShow: TvShow) => void;
}

export default function TvShowCard({ tvShow, avgRating, onEdit, onDelete }: TvShowCardProps) {
    const detailHref = `/tv-shows/${encodeURIComponent(tvShow.title)}`;
    // Lazy initialiser runs only on the client, so localStorage is available
    const [posterSrc, setPosterSrc] = useState<string | null>(() =>
        typeof window !== 'undefined' ? getPoster(tvShow.title) : null
    );

    useEffect(() => {
        let cancelled = false;
        // Check cache first (async to avoid sync setState in effect)
        Promise.resolve(getPoster(tvShow.title)).then((cached) => {
            if (cancelled) return;
            if (cached) { setPosterSrc(cached); return; }
            return searchTvShow(tvShow.title).then((results) => {
                if (cancelled) return;
                const url = posterUrl(results[0]?.poster_path ?? null);
                if (url) { setPoster(tvShow.title, url); setPosterSrc(url); }
            });
        }).catch(() => { });
        return () => { cancelled = true; };
    }, [tvShow.title]);

    return (
        <div className="group relative bg-[#1f1f1f] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#808080] transition-all duration-200 hover:scale-[1.02]">
            {/* Poster — clicking goes to detail */}
            <Link href={detailHref} className="block relative aspect-[2/3] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center overflow-hidden">
                {posterSrc ? (
                    <Image
                        src={posterSrc}
                        alt={tvShow.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                        onError={() => setPosterSrc(null)}
                    />
                ) : (
                    <svg
                        className="w-16 h-16 text-[#808080]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                        />
                    </svg>
                )}

                {/* Age badge */}
                <span className={`absolute top-2 right-2 text-white text-xs font-bold w-8 h-8 rounded-lg flex items-center justify-center ${ageBadgeStyle(tvShow.recommendedAge).bg}`}>
                    {ageBadgeStyle(tvShow.recommendedAge).label}
                </span>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => { e.preventDefault(); onEdit(tvShow); }}
                        aria-label="Editar TV show"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => { e.preventDefault(); onDelete(tvShow); }}
                        aria-label="Excluir TV show"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                    </Button>
                </div>
            </Link>

            {/* Info */}
            <Link href={detailHref} className="block p-3">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="text-white font-semibold text-sm truncate">{tvShow.title}</h3>
                    {avgRating != null ? (
                        <span className="flex items-center gap-0.5 shrink-0">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-white text-xs font-semibold">{avgRating.toFixed(1)}</span>
                        </span>
                    ) : null}
                </div>
                <p className="text-[#808080] text-xs mt-1 line-clamp-2">{tvShow.description}</p>
            </Link>
        </div>
    );
}
