'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@/types';
import {
    getEpisodes,
    getEpisodesBySeason,
    createEpisode,
    updateEpisode,
    deleteEpisode,
} from '@/services/episodes';

interface UseEpisodesState {
    episodes: Episode[];
    loading: boolean;
    error: string | null;
}

export function useEpisodes(filters?: Record<string, unknown>) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseEpisodesState>({
        episodes: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const response = await getEpisodes(filters);
                if (!cancelled) setState({ episodes: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch episodes';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [refreshKey, filters]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateEpisodeInput): Promise<Episode[]> => {
            const result = await createEpisode(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateEpisodeInput): Promise<Episode> => {
            const result = await updateEpisode(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (seasonNumber: number, tvShowTitle: string, episodeNumber: number): Promise<void> => {
            await deleteEpisode(seasonNumber, tvShowTitle, episodeNumber);
            setRefreshKey((k) => k + 1);
        },
        [],
    );

    return {
        episodes: state.episodes,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}

export function useEpisodesBySeason(seasonKey: string, seasonNumber: number, tvShowTitle: string) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseEpisodesState>({
        episodes: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!tvShowTitle || !seasonNumber || !seasonKey) return;
        let cancelled = false;
        async function load() {
            try {
                const response = await getEpisodesBySeason(seasonKey);
                if (!cancelled) setState({ episodes: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch episodes';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [seasonKey, seasonNumber, tvShowTitle, refreshKey]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateEpisodeInput): Promise<Episode[]> => {
            const result = await createEpisode(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateEpisodeInput): Promise<Episode> => {
            const result = await updateEpisode(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (episodeNumber: number): Promise<void> => {
            await deleteEpisode(seasonNumber, tvShowTitle, episodeNumber);
            setRefreshKey((k) => k + 1);
        },
        [seasonNumber, tvShowTitle],
    );

    return {
        episodes: state.episodes,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}
