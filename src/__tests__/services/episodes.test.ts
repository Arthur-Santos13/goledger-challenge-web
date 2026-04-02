import {
    getEpisodes,
    getEpisodesBySeason,
    getEpisodeByKey,
    createEpisode,
    updateEpisode,
    deleteEpisode,
} from '@/services/episodes';
import * as api from '@/services/api';
import type { Episode, CreateEpisodeInput, UpdateEpisodeInput } from '@/types';

jest.mock('@/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

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

describe('getEpisodes', () => {
    it('calls searchAssets with episodes assetType', async () => {
        const mockResponse = { result: [mockEpisode], metadata: null };
        mockedApi.searchAssets.mockResolvedValueOnce(mockResponse);

        const result = await getEpisodes();

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('episodes', undefined, undefined, undefined);
        expect(result).toEqual(mockResponse);
    });
});

describe('getEpisodesBySeason', () => {
    it('calls searchAssets filtering by season @key', async () => {
        mockedApi.searchAssets.mockResolvedValueOnce({ result: [mockEpisode], metadata: null });

        await getEpisodesBySeason('s-key');

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('episodes', { 'season.@key': 's-key' });
    });
});

describe('getEpisodeByKey', () => {
    it('calls readAsset with composite episode key', async () => {
        mockedApi.readAsset.mockResolvedValueOnce(mockEpisode);

        const result = await getEpisodeByKey(1, 'Lost', 1);

        expect(mockedApi.readAsset).toHaveBeenCalledWith({
            '@assetType': 'episodes',
            episodeNumber: 1,
            season: {
                '@assetType': 'seasons',
                number: 1,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            },
        });
        expect(result).toEqual(mockEpisode);
    });
});

describe('createEpisode', () => {
    it('calls createAsset with the input', async () => {
        const input: CreateEpisodeInput = {
            '@assetType': 'episodes',
            episodeNumber: 1,
            title: 'Pilot',
            description: 'The beginning',
            releaseDate: '2004-09-22',
            season: {
                '@assetType': 'seasons',
                number: 1,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            },
        };
        mockedApi.createAsset.mockResolvedValueOnce([mockEpisode]);

        const result = await createEpisode(input);

        expect(mockedApi.createAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual([mockEpisode]);
    });
});

describe('updateEpisode', () => {
    it('calls updateAsset with the input', async () => {
        const input: UpdateEpisodeInput = {
            '@assetType': 'episodes',
            episodeNumber: 1,
            title: 'Pilot Updated',
            season: {
                '@assetType': 'seasons',
                number: 1,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            },
        };
        mockedApi.updateAsset.mockResolvedValueOnce(mockEpisode);

        const result = await updateEpisode(input);

        expect(mockedApi.updateAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockEpisode);
    });
});

describe('deleteEpisode', () => {
    it('calls deleteAsset with composite episode key', async () => {
        mockedApi.deleteAsset.mockResolvedValueOnce(undefined);

        await deleteEpisode(1, 'Lost', 3);

        expect(mockedApi.deleteAsset).toHaveBeenCalledWith({
            '@assetType': 'episodes',
            episodeNumber: 3,
            season: {
                '@assetType': 'seasons',
                number: 1,
                tvShow: { '@assetType': 'tvShows', title: 'Lost' },
            },
        });
    });
});
