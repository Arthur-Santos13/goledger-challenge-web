import {
    getWatchlists,
    getWatchlistByTitle,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
} from '@/services/watchlist';
import * as api from '@/services/api';
import type { Watchlist, CreateWatchlistInput, UpdateWatchlistInput } from '@/types';

jest.mock('@/services/api');

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => jest.clearAllMocks());

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

describe('getWatchlists', () => {
    it('calls searchAssets with watchlist assetType', async () => {
        const mockResponse = { result: [mockWatchlist], metadata: null };
        mockedApi.searchAssets.mockResolvedValueOnce(mockResponse);

        const result = await getWatchlists();

        expect(mockedApi.searchAssets).toHaveBeenCalledWith('watchlist', undefined, undefined, undefined);
        expect(result).toEqual(mockResponse);
    });

    it('forwards filters to searchAssets', async () => {
        mockedApi.searchAssets.mockResolvedValueOnce({ result: [], metadata: null });

        await getWatchlists({ title: 'Favorites' });

        expect(mockedApi.searchAssets).toHaveBeenCalledWith(
            'watchlist',
            { title: 'Favorites' },
            undefined,
            undefined,
        );
    });
});

describe('getWatchlistByTitle', () => {
    it('calls readAsset with the correct watchlist key', async () => {
        mockedApi.readAsset.mockResolvedValueOnce(mockWatchlist);

        const result = await getWatchlistByTitle('Favorites');

        expect(mockedApi.readAsset).toHaveBeenCalledWith({ '@assetType': 'watchlist', title: 'Favorites' });
        expect(result).toEqual(mockWatchlist);
    });
});

describe('createWatchlist', () => {
    it('calls createAsset with the input', async () => {
        const input: CreateWatchlistInput = {
            '@assetType': 'watchlist',
            title: 'Favorites',
            description: 'My favorites',
        };
        mockedApi.createAsset.mockResolvedValueOnce([mockWatchlist]);

        const result = await createWatchlist(input);

        expect(mockedApi.createAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual([mockWatchlist]);
    });
});

describe('updateWatchlist', () => {
    it('calls updateAsset with the input', async () => {
        const input: UpdateWatchlistInput = {
            '@assetType': 'watchlist',
            title: 'Favorites',
            description: 'Updated',
        };
        mockedApi.updateAsset.mockResolvedValueOnce(mockWatchlist);

        const result = await updateWatchlist(input);

        expect(mockedApi.updateAsset).toHaveBeenCalledWith(input);
        expect(result).toEqual(mockWatchlist);
    });
});

describe('deleteWatchlist', () => {
    it('calls deleteAsset with the correct watchlist key', async () => {
        mockedApi.deleteAsset.mockResolvedValueOnce(undefined);

        await deleteWatchlist('Favorites');

        expect(mockedApi.deleteAsset).toHaveBeenCalledWith({
            '@assetType': 'watchlist',
            title: 'Favorites',
        });
    });
});
