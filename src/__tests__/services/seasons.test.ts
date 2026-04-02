import {
    getSeasons,
    getSeasonsByTvShow,
    getSeasonByKey,
    createSeason,
    updateSeason,
    deleteSeason,
} from '@/services/seasons';
import * as api from '@/services/api';
import type { Season, CreateSeasonInput, UpdateSeasonInput } from '@/types';

jest.mock('@/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

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

describe('getSeasons', () => {
    it('calls searchAssets with seasons assetType', async () => {
        const mockResponse = { result: [mockSeason], metadata: null };
        mockedApi.searchAssets.mockResolvedValueOnce(mockResponse);

        const result = await getSeasons();

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('seasons', undefined, undefined, undefined);
        expect(result).toEqual(mockResponse);
    });
});

describe('getSeasonsByTvShow', () => {
    it('calls searchAssets filtering by tvShow @key', async () => {
        mockedApi.searchAssets.mockResolvedValueOnce({ result: [mockSeason], metadata: null });

        await getSeasonsByTvShow('ts-key');

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('seasons', { 'tvShow.@key': 'ts-key' });
    });
});

describe('getSeasonByKey', () => {
    it('calls readAsset with composite season key', async () => {
        mockedApi.readAsset.mockResolvedValueOnce(mockSeason);

        const result = await getSeasonByKey(1, 'Lost');

        expect(mockedApi.readAsset).toHaveBeenCalledWith({
            '@assetType': 'seasons',
            number: 1,
            tvShow: { '@assetType': 'tvShows', title: 'Lost' },
        });
        expect(result).toEqual(mockSeason);
    });
});

describe('createSeason', () => {
    it('calls createAsset with the input', async () => {
        const input: CreateSeasonInput = {
            '@assetType': 'seasons',
            number: 1,
            year: 2004,
            tvShow: { '@assetType': 'tvShows', title: 'Lost' },
        };
        mockedApi.createAsset.mockResolvedValueOnce([mockSeason]);

        const result = await createSeason(input);

        expect(mockedApi.createAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual([mockSeason]);
    });
});

describe('updateSeason', () => {
    it('calls updateAsset with the input', async () => {
        const input: UpdateSeasonInput = {
            '@assetType': 'seasons',
            number: 1,
            year: 2005,
            tvShow: { '@assetType': 'tvShows', title: 'Lost' },
        };
        mockedApi.updateAsset.mockResolvedValueOnce(mockSeason);

        const result = await updateSeason(input);

        expect(mockedApi.updateAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockSeason);
    });
});

describe('deleteSeason', () => {
    it('calls deleteAsset with composite season key', async () => {
        mockedApi.deleteAsset.mockResolvedValueOnce(undefined);

        await deleteSeason(1, 'Lost');

        expect(mockedApi.deleteAsset).toHaveBeenCalledWith({
            '@assetType': 'seasons',
            number: 1,
            tvShow: { '@assetType': 'tvShows', title: 'Lost' },
        });
    });
});
