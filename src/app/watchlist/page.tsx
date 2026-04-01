'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Watchlist, CreateWatchlistInput, UpdateWatchlistInput } from '@/types';
import { useWatchlists } from '@/hooks/useWatchlist';
import { useTvShows } from '@/hooks/useTvShows';
import WatchlistCard from '@/components/watchlist/WatchlistCard';
import WatchlistForm from '@/components/watchlist/WatchlistForm';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function WatchlistPage() {
    const { watchlists, loading, error, create, update, remove } = useWatchlists();
    const { tvShows } = useTvShows();

    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Watchlist | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Watchlist | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return watchlists.filter(
            (w) =>
                w.title.toLowerCase().includes(q) ||
                (w.description ?? '').toLowerCase().includes(q),
        );
    }, [watchlists, search]);

    const tvShowTitleByKey = useMemo(() => {
        const map: Record<string, string> = {};
        tvShows.forEach((ts) => { map[ts['@key']] = ts.title; });
        return map;
    }, [tvShows]);

    const handleCreate = useCallback(
        async (data: CreateWatchlistInput | UpdateWatchlistInput) => {
            await create(data as CreateWatchlistInput);
            setCreateOpen(false);
        },
        [create],
    );

    const handleUpdate = useCallback(
        async (data: CreateWatchlistInput | UpdateWatchlistInput) => {
            await update(data as UpdateWatchlistInput);
            setEditTarget(null);
        },
        [update],
    );

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        await remove(deleteTarget.title);
    }, [deleteTarget, remove]);

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Watchlists</h1>
                    <p className="text-[#808080] text-sm mt-1">
                        {watchlists.length} lista{watchlists.length !== 1 ? 's' : ''} cadastrada{watchlists.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nova Watchlist
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
                <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-4 text-[#e50914] text-sm">
                    Erro ao carregar watchlists: {error}
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <EmptyState
                    message={
                        search
                            ? `Nenhum resultado para "${search}"`
                            : 'Nenhuma watchlist cadastrada ainda'
                    }
                    action={
                        !search ? (
                            <Button onClick={() => setCreateOpen(true)}>Criar primeira Watchlist</Button>
                        ) : undefined
                    }
                />
            )}

            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((wl) => (
                        <WatchlistCard
                            key={wl['@key']}
                            watchlist={wl}
                            tvShowTitleByKey={tvShowTitleByKey}
                            onEdit={setEditTarget}
                            onDelete={setDeleteTarget}
                        />
                    ))}
                </div>
            )}

            {/* Create modal */}
            <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Watchlist">
                <WatchlistForm
                    availableTvShows={tvShows}
                    onSubmit={handleCreate}
                    onCancel={() => setCreateOpen(false)}
                />
            </Modal>

            {/* Edit modal */}
            <Modal open={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Editar Watchlist">
                {editTarget && (
                    <WatchlistForm
                        initial={editTarget}
                        availableTvShows={tvShows}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditTarget(null)}
                    />
                )}
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Excluir Watchlist"
                message={`Tem certeza que deseja excluir a watchlist "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                onConfirm={handleDelete}
                onClose={() => setDeleteTarget(null)}
            />
        </div>
    );
}
