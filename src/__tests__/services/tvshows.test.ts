import {
    getTvShows,
    getTvShowByTitle,
    createTvShow,
    updateTvShow,
    deleteTvShow,
} from '@/services/tvshows';
import * as api from '@/services/api';
import type { TvShow, CreateTvShowInput, UpdateTvShowInput } from '@/types';

jest.mock('@/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

const mockTvShow: TvShow = {
    '@assetType': 'tvShows',
    '@key': 'key-1',
    '@lastTouchBy': 'user',
    '@lastTx': 'tx1',
    '@lastTxID': 'txid1',
    '@lastUpdated': '2024-01-01',
    title: 'Lost',
    description: 'A plane crashes on an island',
    recommendedAge: 14,
};

describe('getTvShows', () => {
    it('calls searchAssets with tvShows assetType', async () => {
        const mockResponse = { result: [mockTvShow], metadata: null };
        mockedApi.searchAssets.mockResolvedValueOnce(mockResponse);

        const result = await getTvShows();

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('tvShows', undefined, undefined, undefined);
        expect(result).toEqual(mockResponse);
    });

    it('forwards filters, limit and bookmark to searchAssets', async () => {
        mockedApi.searchAssets.mockResolvedValueOnce({ result: [], metadata: null });

        await getTvShows({ title: 'Lost' }, 5, 'bm');

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('tvShows', { title: 'Lost' }, 5, 'bm');
    });
});

describe('getTvShowByTitle', () => {
    it('calls readAsset with the correct tvShows key', async () => {
        mockedApi.readAsset.mockResolvedValueOnce(mockTvShow);

        const result = await getTvShowByTitle('Lost');

        expect(mockedApi.readAsset).toHaveBeenCalledWith({ '@assetType': 'tvShows', title: 'Lost' });
        expect(result).toEqual(mockTvShow);
    });
});

describe('createTvShow', () => {
    it('calls createAsset with the input and returns the result', async () => {
        const input: CreateTvShowInput = {
            '@assetType': 'tvShows',
            title: 'Lost',
            description: 'Island',
            recommendedAge: 14,
        };
        mockedApi.createAsset.mockResolvedValueOnce([mockTvShow]);

        const result = await createTvShow(input);

        expect(mockedApi.createAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual([mockTvShow]);
    });
});

describe('updateTvShow', () => {
    it('calls updateAsset with the input and returns the result', async () => {
        const input: UpdateTvShowInput = {
            '@assetType': 'tvShows',
            title: 'Lost',
            description: 'Updated description',
        };
        mockedApi.updateAsset.mockResolvedValueOnce(mockTvShow);

        const result = await updateTvShow(input);

        expect(mockedApi.updateAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockTvShow);
    });
});

describe('deleteTvShow', () => {
    it('calls deleteAsset with the correct tvShows key', async () => {
        mockedApi.deleteAsset.mockResolvedValueOnce(undefined);

        await deleteTvShow('Lost');

        expect(mockedApi.deleteAsset).toHaveBeenCalledWith({ '@assetType': 'tvShows', title: 'Lost' });
    });
});
