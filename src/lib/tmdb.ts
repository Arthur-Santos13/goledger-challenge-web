const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '';
const BASE_URL = 'https://api.themoviedb.org/3';
export const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TmdbTvResult {
    id: number;
    name: string;
    poster_path: string | null;
    overview: string;
    first_air_date: string;
}

export async function searchTvShow(query: string): Promise<TmdbTvResult[]> {
    if (!query.trim() || !API_KEY) return [];
    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []) as TmdbTvResult[];
}

export function posterUrl(path: string | null): string | null {
    return path ? `${POSTER_BASE}${path}` : null;
}
