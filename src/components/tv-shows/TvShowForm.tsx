'use client';

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';
import { searchTvShow, posterUrl, type TmdbTvResult } from '@/lib/tmdb';
import { getPoster, setPoster, removePoster } from '@/lib/posterCache';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { parseApiError } from '@/lib/utils';

const AGE_OPTIONS = [
    { value: 0, label: 'Livre' },
    { value: 10, label: 'Maiores de 10 anos' },
    { value: 12, label: 'Maiores de 12 anos' },
    { value: 14, label: 'Maiores de 14 anos' },
    { value: 16, label: 'Maiores de 16 anos' },
    { value: 18, label: 'Maiores de 18 anos' },
];

interface TvShowFormProps {
    initial?: TvShow;
    onSubmit: (data: CreateTvShowInput | UpdateTvShowInput) => Promise<void>;
    onCancel: () => void;
}

export default function TvShowForm({ initial, onSubmit, onCancel }: TvShowFormProps) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [recommendedAge, setRecommendedAge] = useState(String(initial?.recommendedAge ?? '0'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TMDB
    const [tmdbResults, setTmdbResults] = useState<TmdbTvResult[]>([]);
    const [tmdbLoading, setTmdbLoading] = useState(false);
    const [selectedPoster, setSelectedPoster] = useState<string | null>(
        () => (initial?.title ? getPoster(initial.title) : null)
    );
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isEdit = Boolean(initial);

    // Auto-search TMDB when title changes (debounced 600ms), only on create
    useEffect(() => {
        if (isEdit) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!title.trim()) { setTmdbResults([]); return; }
        debounceRef.current = setTimeout(async () => {
            setTmdbLoading(true);
            const results = await searchTvShow(title);
            setTmdbResults(results.slice(0, 5));
            setTmdbLoading(false);
            // Auto-select first result if no poster chosen yet
            if (results.length > 0 && !selectedPoster) {
                const url = posterUrl(results[0].poster_path);
                if (url) setSelectedPoster(url);
                if (results[0].overview && !description) setDescription(results[0].overview);
            }
        }, 600);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, isEdit]);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setError(null);
            const age = Number(recommendedAge);
            if (!title.trim()) { setError('Título obrigatório'); return; }
            if (!description.trim()) { setError('Descrição obrigatória'); return; }
            if (![0, 10, 12, 14, 16, 18].includes(age)) { setError('Selecione uma classificação etária válida'); return; }

            setLoading(true);
            try {
                const tvTitle = isEdit ? initial!.title : title;
                if (selectedPoster) setPoster(tvTitle, selectedPoster);
                else removePoster(tvTitle);
                const payload = isEdit
                    ? ({ '@assetType': 'tvShows', title: initial!.title, description, recommendedAge: age } as UpdateTvShowInput)
                    : ({ '@assetType': 'tvShows', title, description, recommendedAge: age } as CreateTvShowInput);
                await onSubmit(payload);
            } catch (err) {
                setError(parseApiError(err, { assetType: 'tvShows', identifier: isEdit ? initial!.title : title }));
            } finally {
                setLoading(false);
            }
        },
        [title, description, recommendedAge, isEdit, initial, onSubmit],
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Breaking Bad"
                required
                disabled={isEdit}
            />
            <Textarea
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a série..."
                rows={3}
                required
            />
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#a0a0a0]">Classificação etária</label>
                <select
                    value={recommendedAge}
                    onChange={(e) => setRecommendedAge(e.target.value)}
                    required
                    className="bg-[#2a2a2a] border border-[#3a3a3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] transition-colors"
                >
                    {AGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={String(opt.value)}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-900/10 border border-red-900/30 rounded px-3 py-2">
                    {error}
                </p>
            )}

            {/* TMDB poster picker */}
            {(tmdbLoading || tmdbResults.length > 0 || selectedPoster) && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#a0a0a0]">
                        Poster {tmdbLoading && <span className="text-[#606060] font-normal">buscando...</span>}
                    </label>
                    {/* Selected poster */}
                    {selectedPoster && (
                        <div className="flex items-start gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={selectedPoster} alt="Poster selecionado" className="h-28 w-20 object-cover rounded border border-[#7C3AED]" onError={() => setSelectedPoster(null)} />
                            <button type="button" onClick={() => setSelectedPoster(null)} className="text-xs text-[#606060] hover:text-white mt-1 transition-colors">
                                ✕ Remover
                            </button>
                        </div>
                    )}
                    {/* TMDB results row */}
                    {tmdbResults.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {tmdbResults.map((r) => {
                                const url = posterUrl(r.poster_path);
                                if (!url) return null;
                                const isSelected = selectedPoster === url;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedPoster(isSelected ? null : url)}
                                        className={`shrink-0 rounded overflow-hidden border-2 transition-all ${isSelected ? 'border-[#7C3AED]' : 'border-transparent hover:border-[#808080]'}`}
                                        title={r.name}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt={r.name} className="h-20 w-14 object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
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
