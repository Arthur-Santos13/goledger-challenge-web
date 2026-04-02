import { searchTvShow, posterUrl, POSTER_BASE } from '@/lib/tmdb';

// Mock the global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
    mockFetch.mockReset();
});

// ─── posterUrl ────────────────────────────────────────────────────────────────

describe('posterUrl', () => {
    it('returns full URL when path is provided', () => {
        expect(posterUrl('/abc.jpg')).toBe(`${POSTER_BASE}/abc.jpg`);
    });

    it('returns null when path is null', () => {
        expect(posterUrl(null)).toBeNull();
    });
});

// ─── searchTvShow ─────────────────────────────────────────────────────────────

describe('searchTvShow', () => {
    it('returns empty array for empty query', async () => {
        const result = await searchTvShow('');
        expect(result).toEqual([]);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array for whitespace-only query', async () => {
        const result = await searchTvShow('   ');
        expect(result).toEqual([]);
        expect(mockFetch).not.toHaveBeenCalled();
    });

    // For tests that require an API key, we use jest.isolateModules so the
    // module re-evaluates its module-level const API_KEY with the env var set.
    function loadTmdbWithKey(): (query: string) => Promise<unknown[]> {
        process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
        let fn!: (query: string) => Promise<unknown[]>;
        jest.isolateModules(() => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const mod = require('@/lib/tmdb') as { searchTvShow: (q: string) => Promise<unknown[]> };
            fn = mod.searchTvShow;
        });
        return fn;
    }

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    });

    it('returns results from API on success', async () => {
        const mockResults = [
            { id: 1, name: 'Breaking Bad', poster_path: '/bb.jpg', overview: 'Chemistry', first_air_date: '2008-01-20' },
        ];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: mockResults }),
        });

        const search = loadTmdbWithKey();
        const result = await search('Breaking Bad');
        expect(result).toEqual(mockResults);
    });

    it('returns empty array when fetch response is not ok', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });

        const search = loadTmdbWithKey();
        const result = await search('Breaking Bad');
        expect(result).toEqual([]);
    });

    it('returns empty array when results is undefined in response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        const search = loadTmdbWithKey();
        const result = await search('Breaking Bad');
        expect(result).toEqual([]);
    });
});
