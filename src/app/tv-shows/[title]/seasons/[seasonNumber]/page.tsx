'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@/types';
import { useEpisodesBySeason } from '@/hooks/useEpisodes';
import { useSeason } from '@/hooks/useSeasons';
import EpisodeCard from '@/components/episodes/EpisodeCard';
import EpisodeForm from '@/components/episodes/EpisodeForm';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function SeasonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tvShowTitle = decodeURIComponent(params.title as string);
    const seasonNumber = parseInt(params.seasonNumber as string, 10);

    const { season, loading: loadingSeason } = useSeason(seasonNumber, tvShowTitle);

    const {
        episodes,
        loading,
        error,
        create,
        update,
        remove,
    } = useEpisodesBySeason(season?.['@key'] ?? '', seasonNumber, tvShowTitle);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Episode | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Episode | null>(null);

    const handleCreate = useCallback(
        async (data: CreateEpisodeInput | UpdateEpisodeInput) => {
            await create(data as CreateEpisodeInput);
            setCreateOpen(false);
        },
        [create],
    );

    const handleUpdate = useCallback(
        async (data: CreateEpisodeInput | UpdateEpisodeInput) => {
            await update(data as UpdateEpisodeInput);
            setEditTarget(null);
        },
        [update],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        await remove(deleteTarget.episodeNumber);
        setDeleteTarget(null);
    }, [deleteTarget, remove]);

    const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);

    const ratedEpisodes = sortedEpisodes.filter((e) => e.rating != null);
    const avgRating =
        ratedEpisodes.length > 0
            ? ratedEpisodes.reduce((sum, e) => sum + (e.rating ?? 0), 0) / ratedEpisodes.length
            : null;

    if (loadingSeason) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#141414] px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-[#808080] mb-6">
                        <Link href="/tv-shows" className="hover:text-white transition-colors">
                            TV Shows
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/tv-shows/${encodeURIComponent(tvShowTitle)}`}
                            className="hover:text-white transition-colors"
                        >
                            {tvShowTitle}
                        </Link>
                        <span>/</span>
                        <span className="text-white">Temporada {seasonNumber}</span>
                    </nav>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                                    Temporada {seasonNumber}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">{tvShowTitle}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-[#808080]">
                                    {loading ? '–' : `${episodes.length} episódio${episodes.length !== 1 ? 's' : ''}`}
                                </p>
                                {avgRating != null && (
                                    <span className="flex items-center gap-1 text-sm">
                                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-semibold text-white">{avgRating.toFixed(1)}</span>
                                        <span className="text-[#808080]">/ 10</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.push(`/tv-shows/${encodeURIComponent(tvShowTitle)}`)}
                            >
                                ← Voltar
                            </Button>
                            <Button size="sm" onClick={() => setCreateOpen(true)}>
                                + New Episode
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
                {loading && (
                    <div className="flex justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && (
                    <p className="text-center text-[#7C3AED] py-8">{error}</p>
                )}

                {!loading && !error && sortedEpisodes.length === 0 && (
                    <EmptyState
                        message="Nenhum episódio encontrado. Adicione o primeiro episódio desta temporada."
                        action={
                            <Button onClick={() => setCreateOpen(true)}>+ New Episode</Button>
                        }
                    />
                )}

                {!loading && sortedEpisodes.length > 0 && (
                    <div className="space-y-3">
                        {sortedEpisodes.map((episode) => (
                            <EpisodeCard
                                key={episode['@key']}
                                episode={episode}
                                onEdit={setEditTarget}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create modal */}
            <Modal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="New Episode"
            >
                <EpisodeForm
                    tvShowTitle={tvShowTitle}
                    seasonNumber={seasonNumber}
                    onSubmit={handleCreate}
                    onCancel={() => setCreateOpen(false)}
                />
            </Modal>

            {/* Edit modal */}
            <Modal
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                title="Editar episódio"
            >
                {editTarget && (
                    <EpisodeForm
                        tvShowTitle={tvShowTitle}
                        seasonNumber={seasonNumber}
                        initial={editTarget}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditTarget(null)}
                    />
                )}
            </Modal>

            {/* Delete dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Remover episódio"
                message={`Tem certeza que deseja remover "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Remover"
            />
        </div>
    );
}
