'use client';

import type { Episode } from '@/types';
import Button from '@/components/ui/Button';

interface EpisodeCardProps {
    episode: Episode;
    onEdit: (episode: Episode) => void;
    onDelete: (episode: Episode) => void;
}

export default function EpisodeCard({ episode, onEdit, onDelete }: EpisodeCardProps) {
    const hasRating = episode.rating !== undefined && episode.rating !== null;

    return (
        <div className="group flex items-start gap-4 bg-[#1f1f1f] rounded-lg border border-[#2a2a2a] hover:border-[#808080] transition-all duration-200 p-4">
            {/* Episode number badge */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
                <span className="text-[#7C3AED] font-bold text-lg leading-none">
                    {episode.episodeNumber}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold text-sm leading-snug truncate">
                        {episode.title}
                    </h3>
                    {hasRating && (
                        <span className="flex-shrink-0 text-xs font-bold text-[#f5c518] bg-[#f5c518]/10 px-2 py-0.5 rounded">
                            ★ {episode.rating!.toFixed(1)}
                        </span>
                    )}
                </div>

                {episode.description && (
                    <p className="text-[#808080] text-xs mt-1 line-clamp-2">{episode.description}</p>
                )}

                {episode.releaseDate && (
                    <p className="text-[#555] text-xs mt-2">
                        {new Date(episode.releaseDate).toLocaleDateString('pt-BR')}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(episode)}
                    aria-label="Editar episódio"
                    className="p-1.5"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(episode)}
                    aria-label="Remover episódio"
                    className="p-1.5 hover:text-[#7C3AED]"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </Button>
            </div>
        </div>
    );
}
