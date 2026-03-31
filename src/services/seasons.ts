import type {
    Season,
    CreateSeasonInput,
    UpdateSeasonInput,
    SearchResponse,
} from '@/types';
import {
    searchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    readAsset,
} from './api';

export function getSeasons(
    filters?: Record<string, unknown>,
    limit?: number,
    bookmark?: string,
): Promise<SearchResponse<Season>> {
    return searchAssets<Season>('seasons', filters, limit, bookmark);
}

export function getSeasonsByTvShow(
    tvShowTitle: string,
): Promise<SearchResponse<Season>> {
    return searchAssets<Season>('seasons', {
        'tvShow.title': tvShowTitle,
    });
}

export function getSeasonByKey(
    number: number,
    tvShowTitle: string,
): Promise<Season> {
    return readAsset<Season>({
        '@assetType': 'seasons',
        number,
        tvShow: { '@assetType': 'tvShows', title: tvShowTitle } as unknown as string,
    });
}

export function createSeason(input: CreateSeasonInput): Promise<Season[]> {
    return createAsset<CreateSeasonInput>(input) as Promise<Season[]>;
}

export function updateSeason(input: UpdateSeasonInput): Promise<Season> {
    return updateAsset<UpdateSeasonInput>(input) as Promise<Season>;
}

export function deleteSeason(
    number: number,
    tvShowTitle: string,
): Promise<void> {
    return deleteAsset({
        '@assetType': 'seasons',
        number,
        'tvShow.title': tvShowTitle,
    });
}
