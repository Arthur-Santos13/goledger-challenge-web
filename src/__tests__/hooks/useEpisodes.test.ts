import { renderHook, act, waitFor } from '@testing-library/react';
import { useEpisodes, useEpisodesBySeason } from '@/hooks/useEpisodes';
import * as episodesService from '@/services/episodes';
import type { Episode } from '@/types';

jest.mock('@/services/episodes');
jest.mock('@/services/seasons');

const mockedEpisodes = episodesService as jest.Mocked<typeof episodesService>;

const mockEpisode: Episode = {
    '@assetType': 'episodes',
    '@key': 'ep-key',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    episodeNumber: 1,
    title: 'Pilot',
    description: 'The beginning',
    releaseDate: '2004-09-22',
    season: {
        '@assetType': 'seasons',
        '@key': 's-key',
        number: 1,
        tvShow: { '@assetType': 'tvShows', '@key': 'ts-key' },
    },
};

beforeEach(() => jest.clearAllMocks());

// ─── useEpisodes ──────────────────────────────────────────────────────────────

describe('useEpisodes', () => {
    it('fetches episodes on mount', async () => {
        mockedEpisodes.getEpisodes.mockResolvedValueOnce({ result: [mockEpisode], metadata: null });

        const { result } = renderHook(() => useEpisodes());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.episodes).toEqual([mockEpisode]);
        expect(result.current.error).toBeNull();
    });

    it('sets error state when fetch fails', async () => {
        mockedEpisodes.getEpisodes.mockRejectedValueOnce(new Error('fetch error'));

        const { result } = renderHook(() => useEpisodes());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('fetch error');
    });

    it('create calls createEpisode and triggers refetch', async () => {
        mockedEpisodes.getEpisodes
            .mockResolvedValueOnce({ result: [], metadata: null })
            .mockResolvedValueOnce({ result: [mockEpisode], metadata: null });
        mockedEpisodes.createEpisode.mockResolvedValueOnce([mockEpisode]);

        const { result } = renderHook(() => useEpisodes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.create({
                '@assetType': 'episodes',
                episodeNumber: 1,
                title: 'Pilot',
                description: 'Start',
                releaseDate: '2004-09-22',
                season: {
                    '@assetType': 'seasons',
                    number: 1,
                    tvShow: { '@assetType': 'tvShows', title: 'Lost' },
                },
            });
        });

        expect(mockedEpisodes.createEpisode).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(result.current.episodes).toHaveLength(1));
    });

    it('remove calls deleteEpisode and triggers refetch', async () => {
        mockedEpisodes.getEpisodes
            .mockResolvedValueOnce({ result: [mockEpisode], metadata: null })
            .mockResolvedValueOnce({ result: [], metadata: null });
        mockedEpisodes.deleteEpisode.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useEpisodes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.remove(1, 'Lost', 1);
        });

        expect(mockedEpisodes.deleteEpisode).toHaveBeenCalledWith(1, 'Lost', 1);
        await waitFor(() => expect(result.current.episodes).toHaveLength(0));
    });
});

// ─── useEpisodesBySeason ──────────────────────────────────────────────────────

describe('useEpisodesBySeason', () => {
    it('fetches episodes for a season', async () => {
        mockedEpisodes.getEpisodesBySeason.mockResolvedValueOnce({ result: [mockEpisode], metadata: null });

        const { result } = renderHook(() => useEpisodesBySeason('s-key', 1, 'Lost'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(mockedEpisodes.getEpisodesBySeason).toHaveBeenCalledWith('s-key');
        expect(result.current.episodes).toEqual([mockEpisode]);
    });

    it('does not fetch when any required param is missing', () => {
        renderHook(() => useEpisodesBySeason('', 1, 'Lost'));
        expect(mockedEpisodes.getEpisodesBySeason).not.toHaveBeenCalled();
    });
});
