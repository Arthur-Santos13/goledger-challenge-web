import { getPoster, setPoster, removePoster } from '@/lib/posterCache';

const KEY = 'flixdb_posters';

// Provide a minimal localStorage mock
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
    localStorageMock.clear();
});

// ─── getPoster ────────────────────────────────────────────────────────────────

describe('getPoster', () => {
    it('returns null when no poster is stored', () => {
        expect(getPoster('Breaking Bad')).toBeNull();
    });

    it('returns the stored poster URL', () => {
        localStorageMock.setItem(KEY, JSON.stringify({ 'Breaking Bad': 'https://img/bb.jpg' }));
        expect(getPoster('Breaking Bad')).toBe('https://img/bb.jpg');
    });
});

// ─── setPoster ────────────────────────────────────────────────────────────────

describe('setPoster', () => {
    it('stores a poster URL for a title', () => {
        setPoster('Lost', 'https://img/lost.jpg');
        const stored = JSON.parse(localStorageMock.getItem(KEY) ?? '{}');
        expect(stored['Lost']).toBe('https://img/lost.jpg');
    });

    it('does not remove other posters when adding a new one', () => {
        setPoster('Lost', 'https://img/lost.jpg');
        setPoster('Breaking Bad', 'https://img/bb.jpg');
        const stored = JSON.parse(localStorageMock.getItem(KEY) ?? '{}');
        expect(stored['Lost']).toBe('https://img/lost.jpg');
        expect(stored['Breaking Bad']).toBe('https://img/bb.jpg');
    });
});

// ─── removePoster ─────────────────────────────────────────────────────────────

describe('removePoster', () => {
    it('removes the poster for a given title', () => {
        setPoster('Lost', 'https://img/lost.jpg');
        removePoster('Lost');
        expect(getPoster('Lost')).toBeNull();
    });

    it('does not affect other posters when removing one', () => {
        setPoster('Lost', 'https://img/lost.jpg');
        setPoster('Breaking Bad', 'https://img/bb.jpg');
        removePoster('Lost');
        expect(getPoster('Breaking Bad')).toBe('https://img/bb.jpg');
    });

    it('is a no-op when poster does not exist', () => {
        expect(() => removePoster('NonExistent')).not.toThrow();
    });
});
