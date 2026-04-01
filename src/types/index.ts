// ─── Base API types ───────────────────────────────────────────────────────────

export interface AssetMeta {
    '@assetType': string;
    '@key': string;
    '@lastTouchBy': string;
    '@lastTx': string;
    '@lastTxID': string;
    '@lastUpdated': string;
}

export interface SearchResponse<T> {
    result: T[];
    metadata: {
        fetched_records_count: number;
        bookmark: string;
    } | null;
}

export type AssetKey = {
    '@assetType': string;
} & Record<string, unknown>;

// ─── Reference types (used inside assets as foreign keys) ─────────────────────

export interface TvShowRef {
    '@assetType': 'tvShows';
    '@key': string;
    title?: string;  // present in inputs; NOT returned by API in ref objects
}

export interface SeasonRef {
    '@assetType': 'seasons';
    '@key': string;
    number?: number;  // present in inputs; NOT returned by API in ref objects
    tvShow?: TvShowRef;
}

// ─── Domain asset types ───────────────────────────────────────────────────────

export interface TvShow extends AssetMeta {
    '@assetType': 'tvShows';
    title: string;
    description: string;
    recommendedAge: number;
}

export interface Season extends AssetMeta {
    '@assetType': 'seasons';
    number: number;
    tvShow: TvShowRef;
    year: number;
}

export interface Episode extends AssetMeta {
    '@assetType': 'episodes';
    season: SeasonRef;
    episodeNumber: number;
    title: string;
    releaseDate: string;
    description: string;
    rating?: number;
}

export interface Watchlist extends AssetMeta {
    '@assetType': 'watchlist';
    title: string;
    description?: string;
    tvShows?: TvShowRef[];
}

// ─── Input types (create / update payloads) ───────────────────────────────────

export interface CreateTvShowInput {
    '@assetType': 'tvShows';
    title: string;
    description: string;
    recommendedAge: number;
}

export interface UpdateTvShowInput {
    '@assetType': 'tvShows';
    title: string;
    description?: string;
    recommendedAge?: number;
}

export interface CreateSeasonInput {
    '@assetType': 'seasons';
    number: number;
    tvShow: { '@assetType': 'tvShows'; title: string };
    year: number;
}

export interface UpdateSeasonInput {
    '@assetType': 'seasons';
    number: number;
    tvShow: { '@assetType': 'tvShows'; title: string };
    year?: number;
}

export interface CreateEpisodeInput {
    '@assetType': 'episodes';
    season: {
        '@assetType': 'seasons';
        number: number;
        tvShow: { '@assetType': 'tvShows'; title: string };
    };
    episodeNumber: number;
    title: string;
    releaseDate: string;
    description: string;
    rating?: number;
}

export interface UpdateEpisodeInput {
    '@assetType': 'episodes';
    season: {
        '@assetType': 'seasons';
        number: number;
        tvShow: { '@assetType': 'tvShows'; title: string };
    };
    episodeNumber: number;
    title?: string;
    releaseDate?: string;
    description?: string;
    rating?: number;
}

export interface CreateWatchlistInput {
    '@assetType': 'watchlist';
    title: string;
    description?: string;
    tvShows?: Array<{ '@assetType': 'tvShows'; title: string }>;
}

export interface UpdateWatchlistInput {
    '@assetType': 'watchlist';
    title: string;
    description?: string;
    tvShows?: Array<{ '@assetType': 'tvShows'; title: string }>;
}
