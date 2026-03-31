'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Watchlist, CreateWatchlistInput, UpdateWatchlistInput } from '@/types';
import {
    getWatchlists,
    getWatchlistByTitle,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
} from '@/services/watchlist';

interface UseWatchlistsState {
    watchlists: Watchlist[];
    loading: boolean;
    error: string | null;
}

export function useWatchlists(filters?: Record<string, unknown>) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseWatchlistsState>({
        watchlists: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const response = await getWatchlists(filters);
                if (!cancelled) setState({ watchlists: response.result, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch watchlists';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [refreshKey, filters]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const create = useCallback(
        async (input: CreateWatchlistInput): Promise<Watchlist[]> => {
            const result = await createWatchlist(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const update = useCallback(
        async (input: UpdateWatchlistInput): Promise<Watchlist> => {
            const result = await updateWatchlist(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(
        async (title: string): Promise<void> => {
            await deleteWatchlist(title);
            setRefreshKey((k) => k + 1);
        },
        [],
    );

    return {
        watchlists: state.watchlists,
        loading: state.loading,
        error: state.error,
        refetch,
        create,
        update,
        remove,
    };
}

interface UseWatchlistState {
    watchlist: Watchlist | null;
    loading: boolean;
    error: string | null;
}

export function useWatchlist(title: string) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [state, setState] = useState<UseWatchlistState>({
        watchlist: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!title) return;
        let cancelled = false;
        async function load() {
            try {
                const watchlist = await getWatchlistByTitle(title);
                if (!cancelled) setState({ watchlist, loading: false, error: null });
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch watchlist';
                    setState((prev) => ({ ...prev, loading: false, error: message }));
                }
            }
        }
        void load();
        return () => { cancelled = true; };
    }, [title, refreshKey]);

    const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

    const update = useCallback(
        async (input: UpdateWatchlistInput): Promise<Watchlist> => {
            const result = await updateWatchlist(input);
            setRefreshKey((k) => k + 1);
            return result;
        },
        [],
    );

    const remove = useCallback(async (): Promise<void> => {
        await deleteWatchlist(title);
    }, [title]);

    return {
        watchlist: state.watchlist,
        loading: state.loading,
        error: state.error,
        refetch,
        update,
        remove,
    };
}
