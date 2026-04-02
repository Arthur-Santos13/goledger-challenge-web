'use client';

import { useState, useCallback, type FormEvent } from 'react';
import type { TvShow, Watchlist, CreateWatchlistInput, UpdateWatchlistInput } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { parseApiError } from '@/lib/utils';

interface WatchlistFormProps {
    initial?: Watchlist;
    availableTvShows: TvShow[];
    onSubmit: (data: CreateWatchlistInput | UpdateWatchlistInput) => Promise<void>;
    onCancel: () => void;
}

export default function WatchlistForm({ initial, availableTvShows, onSubmit, onCancel }: WatchlistFormProps) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [selectedTitles, setSelectedTitles] = useState<Set<string>>(
        new Set((initial?.tvShows?.map((t) => t.title).filter(Boolean) ?? []) as string[]),
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(initial);

    const toggleTvShow = useCallback((tvTitle: string) => {
        setSelectedTitles((prev) => {
            const next = new Set(prev);
            if (next.has(tvTitle)) next.delete(tvTitle);
            else next.add(tvTitle);
            return next;
        });
    }, []);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setError(null);
            if (!title.trim()) { setError('Título obrigatório'); return; }

            const tvShows = Array.from(selectedTitles).map((t) => ({
                '@assetType': 'tvShows' as const,
                title: t,
            }));

            setLoading(true);
            try {
                const payload = isEdit
                    ? ({ '@assetType': 'watchlist', title: initial!.title, description: description || undefined, tvShows } as UpdateWatchlistInput)
                    : ({ '@assetType': 'watchlist', title, description: description || undefined, tvShows } as CreateWatchlistInput);
                await onSubmit(payload);
            } catch (err) {
                setError(parseApiError(err, { assetType: 'watchlist', identifier: isEdit ? initial!.title : title }));
            } finally {
                setLoading(false);
            }
        },
        [title, description, selectedTitles, isEdit, initial, onSubmit],
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label="Título da watchlist"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Minha lista"
                required
                disabled={isEdit}
            />
            <Textarea
                label="Descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Séries que quero assistir..."
                rows={2}
            />

            {/* TV Shows multi-select */}
            <div>
                <p className="text-sm text-[#a3a3a3] mb-2 font-medium">
                    Séries{' '}
                    <span className="text-[#555] font-normal">(opcional)</span>
                </p>
                {availableTvShows.length === 0 ? (
                    <p className="text-xs text-[#555]">Nenhuma série disponível.</p>
                ) : (
                    <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
                        {availableTvShows.map((tv) => {
                            const checked = selectedTitles.has(tv.title);
                            return (
                                <label
                                    key={tv['@key']}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${checked
                                        ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/30'
                                        : 'bg-[#2a2a2a] border border-transparent hover:border-[#444]'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="accent-[#7C3AED] w-4 h-4 flex-shrink-0"
                                        checked={checked}
                                        onChange={() => toggleTvShow(tv.title)}
                                    />
                                    <span className="text-sm text-[#d4d4d4] truncate">{tv.title}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-[#7C3AED] bg-purple-900/10 border border-purple-900/30 rounded px-3 py-2">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                    {isEdit ? 'Salvar' : 'Criar'}
                </Button>
            </div>
        </form>
    );
}
