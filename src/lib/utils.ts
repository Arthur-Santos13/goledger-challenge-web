import type { TvShowRef, SeasonRef } from '@/types';

// ─── Asset type labels ────────────────────────────────────────────────────────

const ASSET_LABELS: Record<string, string> = {
    tvShows: 'TV Show',
    seasons: 'Season',
    episodes: 'Episode',
    watchlist: 'Watchlist',
};

export function getAssetTypeLabel(assetType: string): string {
    return ASSET_LABELS[assetType] ?? assetType;
}

// ─── Key builders ─────────────────────────────────────────────────────────────

export function buildTvShowKey(title: string): { '@assetType': 'tvShows'; title: string } {
    return { '@assetType': 'tvShows', title };
}

export function buildSeasonKey(
    tvShowTitle: string,
    number: number,
): { '@assetType': 'seasons'; number: number; tvShow: { '@assetType': 'tvShows'; title: string } } {
    return {
        '@assetType': 'seasons',
        number,
        tvShow: buildTvShowKey(tvShowTitle),
    };
}

export function buildEpisodeKey(
    tvShowTitle: string,
    seasonNumber: number,
    episodeNumber: number,
): {
    '@assetType': 'episodes';
    episodeNumber: number;
    season: { '@assetType': 'seasons'; number: number; tvShow: { '@assetType': 'tvShows'; title: string } };
} {
    return {
        '@assetType': 'episodes',
        episodeNumber,
        season: buildSeasonKey(tvShowTitle, seasonNumber),
    };
}

export function buildWatchlistKey(title: string): { '@assetType': 'watchlist'; title: string } {
    return { '@assetType': 'watchlist', title };
}

// ─── Ref extractors ───────────────────────────────────────────────────────────

export function toTvShowRef(tvShow: TvShowRef | { '@assetType': 'tvShows'; title: string }): TvShowRef {
    return {
        '@assetType': 'tvShows',
        '@key': ('@key' in tvShow ? tvShow['@key'] : '') as string,
        title: tvShow.title,
    };
}

export function toSeasonRef(
    season: SeasonRef | { '@assetType': 'seasons'; number: number; tvShow: TvShowRef },
): SeasonRef {
    return {
        '@assetType': 'seasons',
        '@key': ('@key' in season ? season['@key'] : '') as string,
        number: season.number,
        tvShow: toTvShowRef(season.tvShow),
    };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Format an ISO date string to a human-readable date (locale: pt-BR).
 * Falls back to the raw string if parsing fails.
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

// ─── API error messages ───────────────────────────────────────────────────────

type ApiErrorContext =
    | { assetType: 'tvShows'; identifier?: string }
    | { assetType: 'seasons'; identifier?: number }
    | { assetType: 'episodes'; identifier?: number }
    | { assetType: 'watchlist'; identifier?: string };

export function parseApiError(err: unknown, context: ApiErrorContext): string {
    const status = (err as { response?: { status?: number } })?.response?.status;

    if (status === 409) {
        switch (context.assetType) {
            case 'tvShows':
                return context.identifier
                    ? `A série "${context.identifier}" já existe`
                    : 'Esta série já existe';
            case 'seasons':
                return context.identifier !== undefined
                    ? `A temporada ${context.identifier} já existe`
                    : 'Esta temporada já existe';
            case 'episodes':
                return context.identifier !== undefined
                    ? `O episódio ${context.identifier} já existe`
                    : 'Este episódio já existe';
            case 'watchlist':
                return context.identifier
                    ? `A watchlist "${context.identifier}" já existe`
                    : 'Esta watchlist já existe';
        }
    }

    if (status === 404) {
        switch (context.assetType) {
            case 'tvShows': return 'Série não encontrada';
            case 'seasons': return 'Temporada não encontrada';
            case 'episodes': return 'Episódio não encontrado';
            case 'watchlist': return 'Watchlist não encontrada';
        }
    }

    if (status === 400) return 'Dados inválidos. Verifique os campos e tente novamente.';
    if (status !== undefined && status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';

    if (err instanceof Error) return err.message;
    return 'Erro ao salvar. Tente novamente.';
}

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Returns true if there are more pages to fetch (bookmark is non-empty).
 */
export function hasNextPage(bookmark: string | null | undefined): boolean {
    return typeof bookmark === 'string' && bookmark.length > 0;
}

// ─── Rating helpers ───────────────────────────────────────────────────────────

/**
 * Clamp a rating value between 0 and 10.
 */
export function clampRating(rating: number): number {
    return Math.min(10, Math.max(0, rating));
}

/**
 * Convert a 0-10 rating to a percentage string for display.
 */
export function ratingToPercent(rating: number): string {
    return `${clampRating(rating) * 10}%`;
}
