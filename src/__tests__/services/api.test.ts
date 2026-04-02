import {
    searchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    readAsset,
} from '@/services/api';
import apiClient from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
    },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── searchAssets ─────────────────────────────────────────────────────────────

describe('searchAssets', () => {
    it('posts to /query/search and returns data', async () => {
        const mockData = { result: [{ '@assetType': 'tvShows', title: 'Lost' }], metadata: null };
        mockedClient.post.mockResolvedValueOnce({ data: mockData });

        const result = await searchAssets('tvShows');

        expect(mockedClient.post).toHaveBeenCalledWith('/query/search', {
            query: { selector: { '@assetType': 'tvShows' } },
        });
        expect(result).toEqual(mockData);
    });

    it('includes filters in selector', async () => {
        const mockData = { result: [], metadata: null };
        mockedClient.post.mockResolvedValueOnce({ data: mockData });

        await searchAssets('tvShows', { title: 'Lost' });

        expect(mockedClient.post).toHaveBeenCalledWith('/query/search', {
            query: { selector: { '@assetType': 'tvShows', title: 'Lost' } },
        });
    });

    it('includes limit when provided', async () => {
        mockedClient.post.mockResolvedValueOnce({ data: { result: [], metadata: null } });

        await searchAssets('tvShows', undefined, 10);

        expect(mockedClient.post).toHaveBeenCalledWith('/query/search', {
            query: { selector: { '@assetType': 'tvShows' }, limit: 10 },
        });
    });

    it('includes bookmark when provided', async () => {
        mockedClient.post.mockResolvedValueOnce({ data: { result: [], metadata: null } });

        await searchAssets('tvShows', undefined, undefined, 'bm-token');

        expect(mockedClient.post).toHaveBeenCalledWith('/query/search', {
            query: { selector: { '@assetType': 'tvShows' }, bookmark: 'bm-token' },
        });
    });
});

// ─── createAsset ─────────────────────────────────────────────────────────────

describe('createAsset', () => {
    it('posts to /invoke/createAsset wrapping asset in array', async () => {
        const asset = { '@assetType': 'tvShows', title: 'Lost', description: 'Island', recommendedAge: 14 };
        const mockData = [asset];
        mockedClient.post.mockResolvedValueOnce({ data: mockData });

        const result = await createAsset(asset);

        expect(mockedClient.post).toHaveBeenCalledWith('/invoke/createAsset', { asset: [asset] });
        expect(result).toEqual(mockData);
    });
});

// ─── updateAsset ─────────────────────────────────────────────────────────────

describe('updateAsset', () => {
    it('puts to /invoke/updateAsset with update payload', async () => {
        const update = { '@assetType': 'tvShows', title: 'Lost', description: 'Updated' };
        mockedClient.put.mockResolvedValueOnce({ data: update });

        const result = await updateAsset(update);

        expect(mockedClient.put).toHaveBeenCalledWith('/invoke/updateAsset', { update });
        expect(result).toEqual(update);
    });
});

// ─── deleteAsset ─────────────────────────────────────────────────────────────

describe('deleteAsset', () => {
    it('sends DELETE to /invoke/deleteAsset with key in data', async () => {
        mockedClient.delete.mockResolvedValueOnce({ data: {} });

        const key = { '@assetType': 'tvShows' as const, title: 'Lost' };
        await deleteAsset(key);

        expect(mockedClient.delete).toHaveBeenCalledWith('/invoke/deleteAsset', { data: { key } });
    });
});

// ─── readAsset ────────────────────────────────────────────────────────────────

describe('readAsset', () => {
    it('posts to /query/readAsset with key and returns data', async () => {
        const mockAsset = { '@assetType': 'tvShows', title: 'Lost' };
        mockedClient.post.mockResolvedValueOnce({ data: mockAsset });

        const key = { '@assetType': 'tvShows' as const, title: 'Lost' };
        const result = await readAsset(key);

        expect(mockedClient.post).toHaveBeenCalledWith('/query/readAsset', { key });
        expect(result).toEqual(mockAsset);
    });
});
