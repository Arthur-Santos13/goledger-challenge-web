'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';
import { useTvShows } from '@/hooks/useTvShows';
import TvShowCard from '@/components/tv-shows/TvShowCard';
import TvShowForm from '@/components/tv-shows/TvShowForm';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function TvShowsPage() {
    const router = useRouter();
    const { tvShows, loading, error, create, update, remove } = useTvShows();

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TvShow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<TvShow | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return tvShows.filter((s) =>
            !q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
        );
    }, [tvShows, search]);

    const handleCreate = useCallback(
        async (data: CreateTvShowInput | UpdateTvShowInput) => {
            await create(data as CreateTvShowInput);
            setCreateOpen(false);
            router.push(`/tv-shows/${encodeURIComponent((data as CreateTvShowInput).title)}`);
        },
        [create, router],
    );

    const handleUpdate = useCallback(
        async (data: CreateTvShowInput | UpdateTvShowInput) => {
            await update(data as UpdateTvShowInput);
            setEditTarget(null);
        },
        [update],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        await remove(deleteTarget.title, deleteTarget['@key']);
    }, [deleteTarget, remove]);

    return (
        <div className="min-h-screen pt-8 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">TV Shows</h1>
                        <p className="text-[#808080] text-sm mt-1">
                            {tvShows.length} série{tvShows.length !== 1 ? 's' : ''} cadastrada{tvShows.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New TV Show
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-6 max-w-md">
                    <Input
                        placeholder="Buscar por título ou descrição..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Content */}
                {loading && (
                    <div className="py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && (
                    <div className="bg-purple-900/20 border border-purple-900/40 rounded-lg p-4 text-[#7C3AED] text-sm">
                        Erro ao carregar TV shows: {error}
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <EmptyState
                        message={
                            search
                                ? `Nenhum resultado para "${search}"`
                                : 'Nenhum TV show cadastrado ainda'
                        }
                        action={
                            !search ? (
                                <Button onClick={() => setCreateOpen(true)}>Criar primeiro TV Show</Button>
                            ) : undefined
                        }
                    />
                )}

                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filtered.map((show) => (
                            <TvShowCard
                                key={show['@key']}
                                tvShow={show}
                                onEdit={setEditTarget}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}

                {/* Create modal */}
                <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New TV Show">
                    <TvShowForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
                </Modal>

                {/* Edit modal */}
                <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Editar TV Show">
                    {editTarget && (
                        <TvShowForm
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
                    title="Excluir TV Show"
                    message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
                />
            </div>
        </div>
    );
}
