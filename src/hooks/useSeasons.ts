'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Season, CreateSeasonInput, UpdateSeasonInput } from '@/types';
import {
    getSeasons,
    getSeasonsByTvShow,
    createSeason,
    updateSeason,
    deleteSeason,
} from '@/services/seasons';

interface UseSeasonsState {
    seasons: Season[];
    loading: boolean;
    error: string | null;
}

export function useSeasons(filters?: Record<string, unknown>) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseSeasonsState>({
        seasons: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const response = await getSeasons(filters);
                if (!cancelled) setState({ seasons: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch seasons';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [refreshKey, filters]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateSeasonInput): Promise<Season[]> => {
            const result = await createSeason(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateSeasonInput): Promise<Season> => {
            const result = await updateSeason(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (number: number, tvShowTitle: string): Promise<void> => {
            await deleteSeason(number, tvShowTitle);
            setRefreshKey((k) => k + 1);
        },
        [],
    );

    return {
        seasons: state.seasons,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}

export function useSeasonsByTvShow(tvShowTitle: string) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseSeasonsState>({
        seasons: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!tvShowTitle) return;
        let cancelled = false;
        async function load() {
            try {
                const response = await getSeasonsByTvShow(tvShowTitle);
                if (!cancelled) setState({ seasons: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch seasons';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [tvShowTitle, refreshKey]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateSeasonInput): Promise<Season[]> => {
            const result = await createSeason(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateSeasonInput): Promise<Season> => {
            const result = await updateSeason(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (number: number): Promise<void> => {
            await deleteSeason(number, tvShowTitle);
            setRefreshKey((k) => k + 1);
        },
        [tvShowTitle],
    );

    return {
        seasons: state.seasons,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}
