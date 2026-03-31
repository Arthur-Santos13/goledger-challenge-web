import type {
    Watchlist,
    CreateWatchlistInput,
    UpdateWatchlistInput,
    SearchResponse,
} from '@/types';
import {
    searchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    readAsset,
} from './api';

export function getWatchlists(
    filters?: Record<string, unknown>,
    limit?: number,
    bookmark?: string,
): Promise<SearchResponse<Watchlist>> {
    return searchAssets<Watchlist>('watchlist', filters, limit, bookmark);
}

export function getWatchlistByTitle(title: string): Promise<Watchlist> {
    return readAsset<Watchlist>({ '@assetType': 'watchlist', title });
}

export function createWatchlist(
    input: CreateWatchlistInput,
): Promise<Watchlist[]> {
    return createAsset<CreateWatchlistInput>(input) as Promise<Watchlist[]>;
}

export function updateWatchlist(
    input: UpdateWatchlistInput,
): Promise<Watchlist> {
    return updateAsset<UpdateWatchlistInput>(input) as Promise<Watchlist>;
}

export function deleteWatchlist(title: string): Promise<void> {
    return deleteAsset({ '@assetType': 'watchlist', title });
}
