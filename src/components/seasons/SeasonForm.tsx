'use client';

import { useState, useCallback, type FormEvent } from 'react';
import type { Season, CreateSeasonInput, UpdateSeasonInput } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SeasonFormProps {
    tvShowTitle: string;
    initial?: Season;
    onSubmit: (data: CreateSeasonInput | UpdateSeasonInput) => Promise<void>;
    onCancel: () => void;
}

export default function SeasonForm({ tvShowTitle, initial, onSubmit, onCancel }: SeasonFormProps) {
    const [number, setNumber] = useState(String(initial?.number ?? ''));
    const [year, setYear] = useState(String(initial?.year ?? new Date().getFullYear()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Boolean(initial);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            setError(null);
            const num = Number(number);
            const yr = Number(year);

            if (isNaN(num) || num < 1) { setError('Número da temporada deve ser maior que 0'); return; }
            if (isNaN(yr) || yr < 1900 || yr > 2100) { setError('Ano inválido'); return; }

            setLoading(true);
            try {
                const tvShowRef = { '@assetType': 'tvShows' as const, title: tvShowTitle };
                const payload: CreateSeasonInput | UpdateSeasonInput = {
                    '@assetType': 'seasons',
                    number: num,
                    tvShow: tvShowRef,
                    year: yr,
                };
                await onSubmit(payload);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao salvar');
            } finally {
                setLoading(false);
            }
        },
        [number, year, tvShowTitle, onSubmit],
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-[#2a2a2a] rounded px-3 py-2 text-sm text-[#b3b3b3]">
                TV Show: <span className="text-white font-medium">{tvShowTitle}</span>
            </div>

            <Input
                label="Número da temporada"
                type="number"
                min={1}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="1"
                required
                disabled={isEdit}
            />

            <Input
                label="Ano"
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder={String(new Date().getFullYear())}
                required
            />

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
