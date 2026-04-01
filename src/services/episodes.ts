import type {
    Episode,
    CreateEpisodeInput,
    UpdateEpisodeInput,
    SearchResponse,
} from '@/types';
import {
    searchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    readAsset,
} from './api';

export function getEpisodes(
    filters?: Record<string, unknown>,
    limit?: number,
    bookmark?: string,
): Promise<SearchResponse<Episode>> {
    return searchAssets<Episode>('episodes', filters, limit, bookmark);
}

export function getEpisodesBySeason(
    seasonKey: string,
): Promise<SearchResponse<Episode>> {
    return searchAssets<Episode>('episodes', {
        'season.@key': seasonKey,
    });
}

export function getEpisodeByKey(
    seasonNumber: number,
    tvShowTitle: string,
    episodeNumber: number,
): Promise<Episode> {
    return readAsset<Episode>({
        '@assetType': 'episodes',
        episodeNumber,
        season: {
            '@assetType': 'seasons',
            number: seasonNumber,
            tvShow: { '@assetType': 'tvShows', title: tvShowTitle },
        },
    });
}

export function createEpisode(input: CreateEpisodeInput): Promise<Episode[]> {
    return createAsset<CreateEpisodeInput>(input) as Promise<Episode[]>;
}

export function updateEpisode(input: UpdateEpisodeInput): Promise<Episode> {
    return updateAsset<UpdateEpisodeInput>(input) as Promise<Episode>;
}

export function deleteEpisode(
    seasonNumber: number,
    tvShowTitle: string,
    episodeNumber: number,
): Promise<void> {
    return deleteAsset({
        '@assetType': 'episodes',
        episodeNumber,
        season: {
            '@assetType': 'seasons',
            number: seasonNumber,
            tvShow: { '@assetType': 'tvShows', title: tvShowTitle },
        },
    });
}
