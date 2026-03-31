import type {
    TvShow,
    CreateTvShowInput,
    UpdateTvShowInput,
    SearchResponse,
} from '@/types';
import {
    searchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    readAsset,
} from './api';

export function getTvShows(
    filters?: Record<string, unknown>,
    limit?: number,
    bookmark?: string,
): Promise<SearchResponse<TvShow>> {
    return searchAssets<TvShow>('tvShows', filters, limit, bookmark);
}

export function getTvShowByTitle(title: string): Promise<TvShow> {
    return readAsset<TvShow>({ '@assetType': 'tvShows', title });
}

export function createTvShow(input: CreateTvShowInput): Promise<TvShow[]> {
    return createAsset<CreateTvShowInput>(input) as Promise<TvShow[]>;
}

export function updateTvShow(input: UpdateTvShowInput): Promise<TvShow> {
    return updateAsset<UpdateTvShowInput>(input) as Promise<TvShow>;
}

export function deleteTvShow(title: string): Promise<void> {
    return deleteAsset({ '@assetType': 'tvShows', title });
}
