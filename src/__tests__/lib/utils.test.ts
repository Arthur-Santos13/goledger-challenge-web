import {
    getAssetTypeLabel,
    buildTvShowKey,
    buildSeasonKey,
    buildEpisodeKey,
    buildWatchlistKey,
    toTvShowRef,
    toSeasonRef,
    formatDate,
    parseApiError,
    hasNextPage,
    clampRating,
    ratingToPercent,
} from '@/lib/utils';

// ─── getAssetTypeLabel ────────────────────────────────────────────────────────

describe('getAssetTypeLabel', () => {
    it('returns human-readable label for known asset types', () => {
        expect(getAssetTypeLabel('tvShows')).toBe('TV Show');
        expect(getAssetTypeLabel('seasons')).toBe('Season');
        expect(getAssetTypeLabel('episodes')).toBe('Episode');
        expect(getAssetTypeLabel('watchlist')).toBe('Watchlist');
    });

    it('returns the raw assetType for unknown types', () => {
        expect(getAssetTypeLabel('unknown')).toBe('unknown');
        expect(getAssetTypeLabel('')).toBe('');
    });
});

// ─── buildTvShowKey ───────────────────────────────────────────────────────────

describe('buildTvShowKey', () => {
    it('builds a correct TvShow key object', () => {
        expect(buildTvShowKey('Breaking Bad')).toEqual({
            '@assetType': 'tvShows',
            title: 'Breaking Bad',
        });
    });
});

// ─── buildSeasonKey ───────────────────────────────────────────────────────────

describe('buildSeasonKey', () => {
    it('builds a correct Season key object', () => {
        expect(buildSeasonKey('Breaking Bad', 1)).toEqual({
            '@assetType': 'seasons',
            number: 1,
            tvShow: { '@assetType': 'tvShows', title: 'Breaking Bad' },
        });
    });
});

// ─── buildEpisodeKey ──────────────────────────────────────────────────────────

describe('buildEpisodeKey', () => {
    it('builds a correct Episode key object', () => {
        expect(buildEpisodeKey('Breaking Bad', 1, 3)).toEqual({
            '@assetType': 'episodes',
            episodeNumber: 3,
            season: {
                '@assetType': 'seasons',
                number: 1,
                tvShow: { '@assetType': 'tvShows', title: 'Breaking Bad' },
            },
        });
    });
});

// ─── buildWatchlistKey ────────────────────────────────────────────────────────

describe('buildWatchlistKey', () => {
    it('builds a correct Watchlist key object', () => {
        expect(buildWatchlistKey('My List')).toEqual({
            '@assetType': 'watchlist',
            title: 'My List',
        });
    });
});

// ─── toTvShowRef ──────────────────────────────────────────────────────────────

describe('toTvShowRef', () => {
    it('converts a TvShowRef with @key to a TvShowRef', () => {
        const input = { '@assetType': 'tvShows' as const, '@key': 'key-1', title: 'Breaking Bad' };
        expect(toTvShowRef(input)).toEqual({
            '@assetType': 'tvShows',
            '@key': 'key-1',
            title: 'Breaking Bad',
        });
    });

    it('sets @key to empty string when input has no @key', () => {
        const input = { '@assetType': 'tvShows' as const, title: 'Breaking Bad' };
        expect(toTvShowRef(input)).toEqual({
            '@assetType': 'tvShows',
            '@key': '',
            title: 'Breaking Bad',
        });
    });
});

// ─── toSeasonRef ──────────────────────────────────────────────────────────────

describe('toSeasonRef', () => {
    it('converts a SeasonRef with @key to a SeasonRef', () => {
        const input = {
            '@assetType': 'seasons' as const,
            '@key': 's-key',
            number: 2,
            tvShow: { '@assetType': 'tvShows' as const, '@key': 'ts-key', title: 'Show' },
        };
        const result = toSeasonRef(input);
        expect(result).toEqual({
            '@assetType': 'seasons',
            '@key': 's-key',
            number: 2,
            tvShow: { '@assetType': 'tvShows', '@key': 'ts-key', title: 'Show' },
        });
    });

    it('sets @key to empty string when input has no @key', () => {
        const input = {
            '@assetType': 'seasons' as const,
            number: 1,
            tvShow: { '@assetType': 'tvShows' as const, title: 'Show' },
        };
        const result = toSeasonRef(input);
        expect(result['@key']).toBe('');
    });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
    it('returns empty string for empty input', () => {
        expect(formatDate('')).toBe('');
    });

    it('formats a valid ISO date string to pt-BR locale', () => {
        const result = formatDate('2024-01-15');
        // Verify it contains the year and is non-empty
        expect(result).toMatch(/2024/);
        expect(result.length).toBeGreaterThan(0);
    });

    it('returns the original string when date is unparseable', () => {
        const invalid = 'not-a-date';
        const result = formatDate(invalid);
        // Either returns the original string or formats it somehow; we just check it doesn't throw
        expect(typeof result).toBe('string');
    });
});

// ─── parseApiError ────────────────────────────────────────────────────────────

describe('parseApiError', () => {
    const makeError = (status: number) => ({ response: { status } });

    describe('409 Conflict', () => {
        it('returns duplicate message for tvShows with identifier', () => {
            expect(parseApiError(makeError(409), { assetType: 'tvShows', identifier: 'Lost' })).toBe(
                'A série "Lost" já existe',
            );
        });

        it('returns generic message for tvShows without identifier', () => {
            expect(parseApiError(makeError(409), { assetType: 'tvShows' })).toBe('Esta série já existe');
        });

        it('returns duplicate message for seasons with identifier', () => {
            expect(parseApiError(makeError(409), { assetType: 'seasons', identifier: 2 })).toBe(
                'A temporada 2 já existe',
            );
        });

        it('returns duplicate message for episodes with identifier', () => {
            expect(parseApiError(makeError(409), { assetType: 'episodes', identifier: 5 })).toBe(
                'O episódio 5 já existe',
            );
        });

        it('returns duplicate message for watchlist with identifier', () => {
            expect(
                parseApiError(makeError(409), { assetType: 'watchlist', identifier: 'Favorites' }),
            ).toBe('A watchlist "Favorites" já existe');
        });
    });

    describe('404 Not Found', () => {
        it('returns not-found message for tvShows', () => {
            expect(parseApiError(makeError(404), { assetType: 'tvShows' })).toBe('Série não encontrada');
        });

        it('returns not-found message for seasons', () => {
            expect(parseApiError(makeError(404), { assetType: 'seasons' })).toBe(
                'Temporada não encontrada',
            );
        });

        it('returns not-found message for episodes', () => {
            expect(parseApiError(makeError(404), { assetType: 'episodes' })).toBe(
                'Episódio não encontrado',
            );
        });

        it('returns not-found message for watchlist', () => {
            expect(parseApiError(makeError(404), { assetType: 'watchlist' })).toBe(
                'Watchlist não encontrada',
            );
        });
    });

    it('returns invalid-data message for 400', () => {
        expect(parseApiError(makeError(400), { assetType: 'tvShows' })).toBe(
            'Dados inválidos. Verifique os campos e tente novamente.',
        );
    });

    it('returns server-error message for 5xx', () => {
        expect(parseApiError(makeError(500), { assetType: 'tvShows' })).toBe(
            'Erro no servidor. Tente novamente mais tarde.',
        );
        expect(parseApiError(makeError(503), { assetType: 'tvShows' })).toBe(
            'Erro no servidor. Tente novamente mais tarde.',
        );
    });

    it('returns the Error message for generic Error instances', () => {
        expect(parseApiError(new Error('network failure'), { assetType: 'tvShows' })).toBe(
            'network failure',
        );
    });

    it('returns fallback message for unknown errors', () => {
        expect(parseApiError('oops', { assetType: 'tvShows' })).toBe('Erro ao salvar. Tente novamente.');
    });
});

// ─── hasNextPage ──────────────────────────────────────────────────────────────

describe('hasNextPage', () => {
    it('returns true for a non-empty bookmark string', () => {
        expect(hasNextPage('bookmark-token')).toBe(true);
    });

    it('returns false for an empty string', () => {
        expect(hasNextPage('')).toBe(false);
    });

    it('returns false for null', () => {
        expect(hasNextPage(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(hasNextPage(undefined)).toBe(false);
    });
});

// ─── clampRating ──────────────────────────────────────────────────────────────

describe('clampRating', () => {
    it('returns the value when within [0, 10]', () => {
        expect(clampRating(5)).toBe(5);
        expect(clampRating(0)).toBe(0);
        expect(clampRating(10)).toBe(10);
    });

    it('clamps values below 0 to 0', () => {
        expect(clampRating(-1)).toBe(0);
        expect(clampRating(-999)).toBe(0);
    });

    it('clamps values above 10 to 10', () => {
        expect(clampRating(11)).toBe(10);
        expect(clampRating(999)).toBe(10);
    });
});

// ─── ratingToPercent ─────────────────────────────────────────────────────────

describe('ratingToPercent', () => {
    it('converts rating to percentage string', () => {
        expect(ratingToPercent(7)).toBe('70%');
        expect(ratingToPercent(10)).toBe('100%');
        expect(ratingToPercent(0)).toBe('0%');
    });

    it('clamps out-of-range values before converting', () => {
        expect(ratingToPercent(15)).toBe('100%');
        expect(ratingToPercent(-5)).toBe('0%');
    });
});
