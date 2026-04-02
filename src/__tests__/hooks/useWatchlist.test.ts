import { renderHook, act, waitFor } from '@testing-library/react';
import { useWatchlists, useWatchlist } from '@/hooks/useWatchlist';
import * as watchlistService from '@/services/watchlist';
import type { Watchlist } from '@/types';

jest.mock('@/services/watchlist');

const mockedWatchlist = watchlistService as jest.Mocked<typeof watchlistService>;

const mockWatchlist: Watchlist = {
    '@assetType': 'watchlist',
    '@key': 'wl-key',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title: 'Favorites',
    description: 'My favorites',
    tvShows: [{ '@assetType': 'tvShows', '@key': 'ts-key' }],
};

beforeEach(() => jest.clearAllMocks());

// ─── useWatchlists ────────────────────────────────────────────────────────────

describe('useWatchlists', () => {
    it('fetches watchlists on mount', async () => {
        mockedWatchlist.getWatchlists.mockResolvedValueOnce({ result: [mockWatchlist], metadata: null });

        const { result } = renderHook(() => useWatchlists());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.watchlists).toEqual([mockWatchlist]);
        expect(result.current.error).toBeNull();
    });

    it('sets error state when fetch fails', async () => {
        mockedWatchlist.getWatchlists.mockRejectedValueOnce(new Error('network error'));

        const { result } = renderHook(() => useWatchlists());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('network error');
    });

    it('create calls createWatchlist and triggers refetch', async () => {
        mockedWatchlist.getWatchlists
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [mockWatchlist], metadata: null });
        mockedWatchlist.createWatchlist.mockResolvedValueOnce([mockWatchlist]);

        const { result } = renderHook(() => useWatchlists());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.create({ '@assetType': 'watchlist', title: 'Favorites' });
        });

        expect(mockedWatchlist.createWatchlist).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(result.current.watchlists).toHaveLength(1));
    });

    it('update calls updateWatchlist and triggers refetch', async () => {
        mockedWatchlist.getWatchlists
            .mockResolvedValueOnce({ result: [mockWatchlist], metadata: null })
            .mockResolvedValueOnce({ result: [mockWatchlist], metadata: null });
        mockedWatchlist.updateWatchlist.mockResolvedValueOnce(mockWatchlist);

        const { result } = renderHook(() => useWatchlists());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.update({ '@assetType': 'watchlist', title: 'Favorites', description: 'Updated' });
        });

        expect(mockedWatchlist.updateWatchlist).toHaveBeenCalledTimes(1);
    });

    it('remove calls deleteWatchlist and triggers refetch', async () => {
        mockedWatchlist.getWatchlists
            .mockResolvedValueOnce({ result: [mockWatchlist], metadata: null })
            .mockResolvedValueOnce({ result: [], metadata: null });
        mockedWatchlist.deleteWatchlist.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useWatchlists());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.remove('Favorites');
        });

        expect(mockedWatchlist.deleteWatchlist).toHaveBeenCalledWith('Favorites');
        await waitFor(() => expect(result.current.watchlists).toHaveLength(0));
    });
});

// ─── useWatchlist (single) ────────────────────────────────────────────────────

describe('useWatchlist', () => {
    it('fetches a single watchlist by title', async () => {
        mockedWatchlist.getWatchlistByTitle.mockResolvedValueOnce(mockWatchlist);

        const { result } = renderHook(() => useWatchlist('Favorites'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.watchlist).toEqual(mockWatchlist);
        expect(result.current.error).toBeNull();
    });

    it('sets error when fetch fails', async () => {
        mockedWatchlist.getWatchlistByTitle.mockRejectedValueOnce(new Error('not found'));

        const { result } = renderHook(() => useWatchlist('Favorites'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('not found');
    });

    it('does not fetch when title is empty', () => {
        const { result } = renderHook(() => useWatchlist(''));
        expect(mockedWatchlist.getWatchlistByTitle).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(true);
    });
});
