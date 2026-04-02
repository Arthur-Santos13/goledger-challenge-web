import { renderHook, act, waitFor } from '@testing-library/react';
import { useTvShows, useTvShow } from '@/hooks/useTvShows';
import * as tvShowsService from '@/services/tvshows';
import * as seasonsService from '@/services/seasons';
import * as episodesService from '@/services/episodes';
import * as watchlistService from '@/services/watchlist';
import type { TvShow } from '@/types';

jest.mock('@/services/tvshows');
jest.mock('@/services/seasons');
jest.mock('@/services/episodes');
jest.mock('@/services/watchlist');

const mockedTvShows = tvShowsService as jest.Mocked<typeof tvShowsService>;
const mockedSeasons = seasonsService as jest.Mocked<typeof seasonsService>;
const mockedEpisodes = episodesService as jest.Mocked<typeof episodesService>;
const mockedWatchlist = watchlistService as jest.Mocked<typeof watchlistService>;

const mockTvShow: TvShow = {
    '@assetType': 'tvShows',
    '@key': 'ts-key',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title: 'Lost',
    description: 'Island',
    recommendedAge: 14,
};

beforeEach(() => jest.clearAllMocks());

// ─── useTvShows ───────────────────────────────────────────────────────────────

describe('useTvShows', () => {
    it('starts with loading=true and empty tvShows', () => {
        mockedTvShows.getTvShows.mockReturnValue(new Promise(() => { })); // never resolves
        const { result } = renderHook(() => useTvShows());
        expect(result.current.loading).toBe(true);
        expect(result.current.tvShows).toEqual([]);
    });

    it('fetches and exposes tvShows on mount', async () => {
        mockedTvShows.getTvShows.mockResolvedValueOnce({ result: [mockTvShow], metadata: null });

        const { result } = renderHook(() => useTvShows());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.tvShows).toEqual([mockTvShow]);
        expect(result.current.error).toBeNull();
    });

    it('sets error state when fetch fails', async () => {
        mockedTvShows.getTvShows.mockRejectedValueOnce(new Error('network error'));

        const { result } = renderHook(() => useTvShows());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('network error');
        expect(result.current.tvShows).toEqual([]);
    });

    it('refetch triggers re-fetch', async () => {
        mockedTvShows.getTvShows
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null })
            .mockResolvedValueOnce({ result: [], metadata: null });

        const { result } = renderHook(() => useTvShows());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.tvShows).toHaveLength(1);

        act(() => result.current.refetch());

        await waitFor(() => expect(result.current.tvShows).toHaveLength(0));
        expect(mockedTvShows.getTvShows).toHaveBeenCalledTimes(2);
    });

    it('create calls createTvShow and triggers refetch', async () => {
        mockedTvShows.getTvShows
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null });
        mockedTvShows.createTvShow.mockResolvedValueOnce([mockTvShow]);

        const { result } = renderHook(() => useTvShows());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.create({
                '@assetType': 'tvShows',
                title: 'Lost',
                description: 'Island',
                recommendedAge: 14,
            });
        });

        expect(mockedTvShows.createTvShow).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(result.current.tvShows).toHaveLength(1));
    });

    it('update calls updateTvShow and triggers refetch', async () => {
        mockedTvShows.getTvShows
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null })
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null });
        mockedTvShows.updateTvShow.mockResolvedValueOnce(mockTvShow);

        const { result } = renderHook(() => useTvShows());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.update({ '@assetType': 'tvShows', title: 'Lost', description: 'Updated' });
        });

        expect(mockedTvShows.updateTvShow).toHaveBeenCalledTimes(1);
    });

    it('remove cascades deletion of seasons/episodes, cleans watchlists, then deletes tv show', async () => {
        const mockSeason = {
            '@assetType': 'seasons' as const,
            '@key': 's-key',
            '@lastTouchBy': 'user',
            '@lastTx': 'tx1',
            '@lastTxID': 'txid1',
            '@lastUpdated': '2024-01-01',
            number: 1,
            year: 2004,
            tvShow: { '@assetType': 'tvShows' as const, '@key': 'ts-key' },
        };
        const mockEpisode = {
            '@assetType': 'episodes' as const,
            '@key': 'ep-key',
            '@lastTouchBy': 'user',
            '@lastTx': 'tx1',
            '@lastTxID': 'txid1',
            '@lastUpdated': '2024-01-01',
            episodeNumber: 1,
            title: 'Pilot',
            description: 'Start',
            releaseDate: '2004-09-22',
            season: { '@assetType': 'seasons' as const, '@key': 's-key', number: 1, tvShow: { '@assetType': 'tvShows' as const, '@key': 'ts-key' } },
        };

        mockedTvShows.getTvShows
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null }) // initial load
            .mockResolvedValueOnce({ result: [mockTvShow], metadata: null }) // getTvShows(undefined, 1000)
            .mockResolvedValueOnce({ result: [], metadata: null }); // after delete
        mockedSeasons.getSeasonsByTvShow.mockResolvedValueOnce({ result: [mockSeason], metadata: null });
        mockedEpisodes.getEpisodesBySeason.mockResolvedValueOnce({ result: [mockEpisode], metadata: null });
        mockedEpisodes.deleteEpisode.mockResolvedValueOnce(undefined);
        mockedSeasons.deleteSeason.mockResolvedValueOnce(undefined);
        mockedWatchlist.getWatchlists.mockResolvedValueOnce({ result: [], metadata: null });
        mockedTvShows.deleteTvShow.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useTvShows());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.remove('Lost', 'ts-key');
        });

        expect(mockedEpisodes.deleteEpisode).toHaveBeenCalledWith(1, 'Lost', 1);
        expect(mockedSeasons.deleteSeason).toHaveBeenCalledWith(1, 'Lost');
        expect(mockedTvShows.deleteTvShow).toHaveBeenCalledWith('Lost');
    });
});

// ─── useTvShow (single) ───────────────────────────────────────────────────────

describe('useTvShow', () => {
    it('starts with loading=true and tvShow=null', () => {
        mockedTvShows.getTvShowByTitle.mockReturnValue(new Promise(() => { }));
        const { result } = renderHook(() => useTvShow('Lost'));
        expect(result.current.loading).toBe(true);
        expect(result.current.tvShow).toBeNull();
    });

    it('fetches a single tv show by title', async () => {
        mockedTvShows.getTvShowByTitle.mockResolvedValueOnce(mockTvShow);

        const { result } = renderHook(() => useTvShow('Lost'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.tvShow).toEqual(mockTvShow);
        expect(result.current.error).toBeNull();
    });

    it('sets error when fetch fails', async () => {
        mockedTvShows.getTvShowByTitle.mockRejectedValueOnce(new Error('not found'));

        const { result } = renderHook(() => useTvShow('Lost'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('not found');
    });

    it('does not fetch when title is empty', () => {
        const { result } = renderHook(() => useTvShow(''));
        expect(mockedTvShows.getTvShowByTitle).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(true);
    });
});
