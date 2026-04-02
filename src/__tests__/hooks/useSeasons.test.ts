import { renderHook, act, waitFor } from '@testing-library/react';
import { useSeasons, useSeasonsByTvShow } from '@/hooks/useSeasons';
import * as seasonsService from '@/services/seasons';
import * as episodesService from '@/services/episodes';
import type { Season } from '@/types';

jest.mock('@/services/seasons');
jest.mock('@/services/episodes');

const mockedSeasons = seasonsService as jest.Mocked<typeof seasonsService>;
const mockedEpisodes = episodesService as jest.Mocked<typeof episodesService>;

const mockSeason: Season = {
    '@assetType': 'seasons',
    '@key': 's-key',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    number: 1,
    year: 2004,
    tvShow: { '@assetType': 'tvShows', '@key': 'ts-key' },
};

beforeEach(() => jest.clearAllMocks());

// ─── useSeasons ───────────────────────────────────────────────────────────────

describe('useSeasons', () => {
    it('fetches seasons on mount', async () => {
        mockedSeasons.getSeasons.mockResolvedValueOnce({ result: [mockSeason], metadata: null });

        const { result } = renderHook(() => useSeasons());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.seasons).toEqual([mockSeason]);
        expect(result.current.error).toBeNull();
    });

    it('sets error state when fetch fails', async () => {
        mockedSeasons.getSeasons.mockRejectedValueOnce(new Error('fetch error'));

        const { result } = renderHook(() => useSeasons());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('fetch error');
    });

    it('create calls createSeason and triggers refetch', async () => {
        mockedSeasons.getSeasons
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [mockSeason], metadata: null });
        mockedSeasons.createSeason.mockResolvedValueOnce([mockSeason]);

        const { result } = renderHook(() => useSeasons());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.create({
                '@assetType': 'seasons',
                number: 1,
                year: 2004,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            });
        });

        expect(mockedSeasons.createSeason).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(result.current.seasons).toHaveLength(1));
    });

    it('remove deletes episodes then the season', async () => {
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
        mockedSeasons.getSeasons
            .mockResolvedValueOnce({ result: [mockSeason], metadata: null })
            .mockResolvedValueOnce({ result: [], metadata: null });
        mockedEpisodes.getEpisodesBySeason.mockResolvedValueOnce({ result: [mockEpisode], metadata: null });
        mockedEpisodes.deleteEpisode.mockResolvedValueOnce(undefined);
        mockedSeasons.deleteSeason.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useSeasons());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.remove(1, 'Lost', 's-key');
        });

        expect(mockedEpisodes.deleteEpisode).toHaveBeenCalledWith(1, 'Lost', 1);
        expect(mockedSeasons.deleteSeason).toHaveBeenCalledWith(1, 'Lost');
    });
});

// ─── useSeasonsByTvShow ───────────────────────────────────────────────────────

describe('useSeasonsByTvShow', () => {
    it('fetches seasons for a TV show', async () => {
        mockedSeasons.getSeasonsByTvShow.mockResolvedValueOnce({ result: [mockSeason], metadata: null });

        const { result } = renderHook(() => useSeasonsByTvShow('ts-key', 'Lost'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockedSeasons.getSeasonsByTvShow).toHaveBeenCalledWith('ts-key');
        expect(result.current.seasons).toEqual([mockSeason]);
    });

    it('does not fetch when tvShowKey is empty', () => {
        const { result } = renderHook(() => useSeasonsByTvShow('', 'Lost'));
        expect(mockedSeasons.getSeasonsByTvShow).not.toHaveBeenCalled();
        expect(result.current.loading).toBe(true);
    });
});
