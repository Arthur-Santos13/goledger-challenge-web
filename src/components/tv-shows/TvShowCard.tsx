'use client';

import Link from 'next/link';
import type { TvShow } from '@/types';
import Button from '@/components/ui/Button';

interface TvShowCardProps {
    tvShow: TvShow;
    onEdit: (tvShow: TvShow) => void;
    onDelete: (tvShow: TvShow) => void;
}

export default function TvShowCard({ tvShow, onEdit, onDelete }: TvShowCardProps) {
    return (
        <div className="group relative bg-[#1f1f1f] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#808080] transition-all duration-200 hover:scale-[1.02]">
            {/* Poster placeholder */}
            <div className="relative aspect-[2/3] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center">
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

                {/* Age badge */}
                <span className="absolute top-2 right-2 bg-[#e50914] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    {tvShow.recommendedAge}+
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
            </div>

            {/* Info */}
            <Link href={`/tv-shows/${encodeURIComponent(tvShow.title)}`} className="block p-3">
                <h3 className="text-white font-semibold text-sm truncate">{tvShow.title}</h3>
                <p className="text-[#808080] text-xs mt-1 line-clamp-2">{tvShow.description}</p>
            </Link>
        </div>
    );
}
