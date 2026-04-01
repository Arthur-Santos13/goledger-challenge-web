'use client';

import { useState, useCallback, type FormEvent } from 'react';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

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

    const isEdit = Boolean(initial);

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
