import apiClient from '@/lib/axios';
import type { AssetKey, SearchResponse } from '@/types';

/**
 * Search assets using CouchDB rich queries.
 * Docs: https://docs.couchdb.org/en/stable/api/database/find.html
 */
export async function searchAssets<T>(
    assetType: string,
    filters?: Record<string, unknown>,
    limit?: number,
    bookmark?: string,
): Promise<SearchResponse<T>> {
    const { data } = await apiClient.post<SearchResponse<T>>('/query/search', {
        query: {
            selector: {
                '@assetType': assetType,
                ...filters,
            },
            ...(limit !== undefined && { limit }),
            ...(bookmark ? { bookmark } : {}),
        },
    });
    return data;
}

/**
 * Create one or more assets on the blockchain.
 */
export async function createAsset<T>(asset: T): Promise<T[]> {
    const { data } = await apiClient.post<T[]>('/invoke/createAsset', {
        asset: [asset],
    });
    return data;
}

/**
 * Update fields of an existing asset (primary key must be included).
 */
export async function updateAsset<T>(update: T): Promise<T> {
    const { data } = await apiClient.put<T>('/invoke/updateAsset', { update });
    return data;
}

/**
 * Delete an asset by its primary key.
 */
export async function deleteAsset(key: AssetKey): Promise<void> {
    await apiClient.delete('/invoke/deleteAsset', { data: { key } });
}

/**
 * Read a single asset by its primary key.
 */
export async function readAsset<T>(key: AssetKey): Promise<T> {
    const { data } = await apiClient.post<T>('/query/readAsset', { key });
    return data;
}

/**
 * Get the schema for all asset types, or for a specific one.
 */
export async function getSchema(assetType?: string): Promise<unknown> {
    if (assetType) {
        const { data } = await apiClient.post('/query/getSchema', { assetType });
        return data;
    }
    const { data } = await apiClient.get('/query/getSchema');
    return data;
}
