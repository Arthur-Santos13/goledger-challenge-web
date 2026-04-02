'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Season, CreateSeasonInput, UpdateSeasonInput } from '@/types';
import { useTvShow } from '@/hooks/useTvShows';
import { useSeasonsByTvShow } from '@/hooks/useSeasons';
import { getPoster, setPoster } from '@/lib/posterCache';
import { searchTvShow, posterUrl } from '@/lib/tmdb';
import SeasonCard from '@/components/seasons/SeasonCard';
import SeasonForm from '@/components/seasons/SeasonForm';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function TvShowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const title = decodeURIComponent(params.title as string);

    const { tvShow, loading: loadingShow } = useTvShow(title);
    const { seasons, loading: loadingSeasons, create, update, remove } = useSeasonsByTvShow(
        tvShow?.['@key'] ?? '',
        title,
    );

    const [posterSrc, setPosterSrc] = useState<string | null>(
        () => typeof window !== 'undefined' ? getPoster(title) : null
    );

    useEffect(() => {
        let cancelled = false;
        Promise.resolve(getPoster(title)).then((cached) => {
            if (cancelled) return;
            if (cached) { setPosterSrc(cached); return; }
            return searchTvShow(title).then((results) => {
                if (cancelled) return;
                const url = posterUrl(results[0]?.poster_path ?? null);
                if (url) { setPoster(title, url); setPosterSrc(url); }
            });
        }).catch(() => { });
        return () => { cancelled = true; };
    }, [title]);

    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Season | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Season | null>(null);
    const [seasonAvgRatings, setSeasonAvgRatings] = useState<Record<string, number | null>>({});

    const handleAvgRatingReady = useCallback((seasonKey: string, avg: number | null) => {
        setSeasonAvgRatings((prev) => {
            if (prev[seasonKey] === avg) return prev;
            return { ...prev, [seasonKey]: avg };
        });
    }, []);

    const seasonAvgs = Object.values(seasonAvgRatings).filter((v): v is number => v != null);
    const overallAvg = seasonAvgs.length > 0
        ? seasonAvgs.reduce((s, v) => s + v, 0) / seasonAvgs.length
        : null;

    const handleCreate = useCallback(
        async (data: CreateSeasonInput | UpdateSeasonInput) => {
            await create(data as CreateSeasonInput);
            setCreateOpen(false);
        },
        [create],
    );

    const handleUpdate = useCallback(
        async (data: CreateSeasonInput | UpdateSeasonInput) => {
            await update(data as UpdateSeasonInput);
            setEditTarget(null);
        },
        [update],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        await remove(deleteTarget.number, deleteTarget['@key']);
    }, [deleteTarget, remove]);

    if (loadingShow) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!tvShow) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-[#808080]">TV Show não encontrado</p>
                <Button variant="secondary" onClick={() => router.push('/tv-shows')}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#141414] px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-[#808080] mb-6">
                        <Link href="/tv-shows" className="hover:text-white transition-colors">
                            TV Shows
                        </Link>
                        <span>/</span>
                        <span className="text-white">{tvShow.title}</span>
                    </nav>

                    {/* Show info */}
                    <div className="flex gap-6">
                        {/* Poster */}
                        <div className="hidden sm:block relative w-32 h-48 shrink-0 rounded-lg overflow-hidden bg-[#2a2a2a]">
                            {posterSrc ? (
                                <Image
                                    src={posterSrc}
                                    alt={tvShow.title}
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                    onError={() => setPosterSrc(null)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[#808080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-bold text-white">{tvShow.title}</h1>
                            <div className="flex items-center gap-3 text-sm text-[#b3b3b3]">
                                <span className="bg-[#7C3AED] text-white text-xs font-bold px-2 py-0.5 rounded">
                                    {tvShow.recommendedAge}+
                                </span>
                                <span>{seasons.length} temporada{seasons.length !== 1 ? 's' : ''}</span>
                                {overallAvg != null && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-semibold text-white">{overallAvg.toFixed(1)}</span>
                                        <span className="text-[#808080]">/ 10</span>
                                    </span>
                                )}
                            </div>
                            <p className="text-[#b3b3b3] text-sm max-w-2xl mt-2">{tvShow.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seasons section */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Temporadas</h2>
                    <Button onClick={() => setCreateOpen(true)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Season
                    </Button>
                </div>

                {loadingSeasons && <LoadingSpinner />}

                {!loadingSeasons && seasons.length === 0 && (
                    <EmptyState
                        message="Nenhuma temporada cadastrada ainda"
                        action={<Button onClick={() => setCreateOpen(true)}>Criar primeira temporada</Button>}
                    />
                )}

                {!loadingSeasons && seasons.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {seasons
                            .slice()
                            .sort((a, b) => a.number - b.number)
                            .map((season) => (
                                <SeasonCard
                                    key={season['@key']}
                                    season={season}
                                    tvShowTitle={tvShow.title}
                                    onEdit={setEditTarget}
                                    onDelete={setDeleteTarget}
                                    onAvgRatingReady={handleAvgRatingReady}
                                />
                            ))}
                    </div>
                )}
            </div>

            {/* Create season modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Season">
                <SeasonForm
                    tvShowTitle={title}
                    onSubmit={handleCreate}
                    onCancel={() => setCreateOpen(false)}
                />
            </Modal>

            {/* Edit season modal */}
            <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Editar Temporada">
                {editTarget && (
                    <SeasonForm
                        tvShowTitle={title}
                        initial={editTarget}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditTarget(null)}
                    />
                )}
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Excluir Temporada"
                message={`Tem certeza que deseja excluir a Temporada ${deleteTarget?.number}? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
}
