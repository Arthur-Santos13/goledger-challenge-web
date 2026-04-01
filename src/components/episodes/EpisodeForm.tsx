'use client';

import { useState } from 'react';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface EpisodeFormProps {
    tvShowTitle: string;
    seasonNumber: number;
    initial?: Episode;
    onSubmit: (data: CreateEpisodeInput | UpdateEpisodeInput) => Promise<void>;
    onCancel: () => void;
}

export default function EpisodeForm({
    tvShowTitle,
    seasonNumber,
    initial,
    onSubmit,
    onCancel,
}: EpisodeFormProps) {
    const [episodeNumber, setEpisodeNumber] = useState(
        initial?.episodeNumber?.toString() ?? '',
    );
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [releaseDate, setReleaseDate] = useState(
        initial?.releaseDate ? initial.releaseDate.slice(0, 10) : '',
    );
    const [rating, setRating] = useState(initial?.rating?.toString() ?? '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!initial;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const epNum = parseInt(episodeNumber, 10);
        if (!episodeNumber || isNaN(epNum) || epNum < 1) {
            setError('Número do episódio deve ser um inteiro positivo.');
            return;
        }
        if (!title.trim()) {
            setError('Título é obrigatório.');
            return;
        }

        const seasonRef = {
            '@assetType': 'seasons' as const,
            number: seasonNumber,
            tvShow: { '@assetType': 'tvShows' as const, title: tvShowTitle },
        };

        const payload: CreateEpisodeInput | UpdateEpisodeInput = {
            '@assetType': 'episodes',
            season: seasonRef,
            episodeNumber: epNum,
            title: title.trim(),
            releaseDate: releaseDate || '',
            description: description.trim(),
            ...(rating ? { rating: parseFloat(rating) } : {}),
        };

        setLoading(true);
        try {
            await onSubmit(payload);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar episódio.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Número do episódio"
                    type="number"
                    min={1}
                    value={episodeNumber}
                    onChange={(e) => setEpisodeNumber(e.target.value)}
                    placeholder="1"
                    disabled={isEditing}
                    required
                />
                <Input
                    label="Nota (0–10)"
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Opcional"
                />
            </div>

            <Input
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do episódio"
                required
            />

            <Input
                label="Data de lançamento"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
            />

            <Textarea
                label="Descrição"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o episódio..."
                rows={3}
            />

            {error && <p className="text-[#e50914] text-sm">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" loading={loading}>
                    {isEditing ? 'Salvar alterações' : 'Criar episódio'}
                </Button>
            </div>
        </form>
    );
}
