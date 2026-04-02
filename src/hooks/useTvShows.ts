'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';
import {
    getTvShows,
    getTvShowByTitle,
    createTvShow,
    updateTvShow,
    deleteTvShow,
} from '@/services/tvshows';
import { getSeasonsByTvShow, deleteSeason } from '@/services/seasons';
import { getEpisodesBySeason, deleteEpisode } from '@/services/episodes';
import { getWatchlists, updateWatchlist } from '@/services/watchlist';

interface UseTvShowsState {
    tvShows: TvShow[];
    loading: boolean;
    error: string | null;
}

export function useTvShows(filters?: Record<string, unknown>) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseTvShowsState>({
        tvShows: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const response = await getTvShows(filters);
                if (!cancelled) setState({ tvShows: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch TV shows';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [refreshKey, filters]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateTvShowInput): Promise<TvShow[]> => {
            const result = await createTvShow(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateTvShowInput): Promise<TvShow> => {
            const result = await updateTvShow(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (title: string, tvShowKey: string): Promise<void> => {
            // 1. Delete all episodes and seasons belonging to this TV show
            const { result: seasons } = await getSeasonsByTvShow(tvShowKey);
            for (const season of seasons) {
                const { result: episodes } = await getEpisodesBySeason(season['@key']);
                for (const episode of episodes) {
                    await deleteEpisode(season.number, title, episode.episodeNumber);
                }
                await deleteSeason(season.number, title);
            }

            // 2. Remove this TV show from any watchlists that reference it
            const [{ result: watchlists }, { result: allTvShows }] = await Promise.all([
                getWatchlists(),
                getTvShows(undefined, 1000),
            ]);
            const keyToTitle: Record<string, string> = {};
            for (const ts of allTvShows) keyToTitle[ts['@key']] = ts.title;

            for (const watchlist of watchlists) {
                const refs = watchlist.tvShows ?? [];
                if (refs.some((ref) => ref['@key'] === tvShowKey)) {
                    const remaining = refs
                        .filter((ref) => ref['@key'] !== tvShowKey)
                        .filter((ref) => keyToTitle[ref['@key']] !== undefined)
                        .map((ref) => ({
                            '@assetType': 'tvShows' as const,
                            title: keyToTitle[ref['@key']],
                        }));
                    await updateWatchlist({
                        '@assetType': 'watchlist',
                        title: watchlist.title,
                        tvShows: remaining,
                    });
                }
            }

            // 3. Delete the TV show itself
            await deleteTvShow(title);
            setRefreshKey((k) => k + 1);
        },
        [],
    );

    return {
        tvShows: state.tvShows,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}

interface UseTvShowState {
    tvShow: TvShow | null;
    loading: boolean;
    error: string | null;
}

export function useTvShow(title: string) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseTvShowState>({
        tvShow: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!title) return;
        let cancelled = false;
        async function load() {
            try {
                const tvShow = await getTvShowByTitle(title);
                if (!cancelled) setState({ tvShow, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch TV show';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [title, refreshKey]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    return {
        tvShow: state.tvShow,
        loading: state.loading,
        error: state.error,
        refetch,
    };
}
