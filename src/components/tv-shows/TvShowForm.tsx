'use client';

import { useState, useCallback, type FormEvent } from 'react';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface TvShowFormProps {
    initial?: TvShow;
    onSubmit: (data: CreateTvShowInput | UpdateTvShowInput) => Promise<void>;
    onCancel: () => void;
}

export default function TvShowForm({ initial, onSubmit, onCancel }: TvShowFormProps) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [recommendedAge, setRecommendedAge] = useState(String(initial?.recommendedAge ?? ''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(initial);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setError(null);
            const age = Number(recommendedAge);
            if (!title.trim()) { setError('Título obrigatório'); return; }
            if (!description.trim()) { setError('Descrição obrigatória'); return; }
            if (isNaN(age) || age < 0 || age > 18) { setError('Idade recomendada deve ser entre 0 e 18'); return; }

            setLoading(true);
            try {
                const payload = isEdit
                    ? ({ '@assetType': 'tvShows', title: initial!.title, description, recommendedAge: age } as UpdateTvShowInput)
                    : ({ '@assetType': 'tvShows', title, description, recommendedAge: age } as CreateTvShowInput);
                await onSubmit(payload);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao salvar');
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
            <Input
                label="Idade recomendada"
                type="number"
                min={0}
                max={18}
                value={recommendedAge}
                onChange={(e) => setRecommendedAge(e.target.value)}
                placeholder="16"
                required
            />

            {error && (
                <p className="text-sm text-[#e50914] bg-red-900/10 border border-red-900/30 rounded px-3 py-2">
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
