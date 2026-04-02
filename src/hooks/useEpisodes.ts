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
import { getSeasons } from '@/services/seasons';

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


export function useTvShowAvgRating(tvShowKey: string): { avg: number | null; loading: boolean } {
    const [avg, setAvg] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tvShowKey) { setLoading(false); return; }
        let cancelled = false;
        setLoading(true);
        // CouchDB doesn't support 2-level deep dot notation (season.tvShow.@key),
        // so we chain: get seasons by tvShow key → episodes per season → aggregate avg.
        getSeasons({ 'tvShow.@key': tvShowKey })
            .then(async (seasonsRes) => {
                if (cancelled) return;
                const seasonKeys = seasonsRes.result.map((s) => s['@key']);
                if (seasonKeys.length === 0) { setAvg(null); setLoading(false); return; }
                const allEpisodes: Episode[] = [];
                await Promise.all(
                    seasonKeys.map((key) =>
                        getEpisodesBySeason(key).then((r) => allEpisodes.push(...r.result)),
                    ),
                );
                if (cancelled) return;
                const rated = allEpisodes.filter((e) => e.rating != null);
                setAvg(
                    rated.length > 0
                        ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length
                        : null,
                );
                setLoading(false);
            })
            .catch(() => { if (!cancelled) { setAvg(null); setLoading(false); } });
        return () => { cancelled = true; };
    }, [tvShowKey]);

    return { avg, loading };
}