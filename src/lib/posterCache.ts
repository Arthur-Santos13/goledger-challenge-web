const KEY = 'flixdb_posters';

function load(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; }
}

export function getPoster(title: string): string | null {
    return load()[title] ?? null;
}

export function setPoster(title: string, url: string): void {
    const map = load();
    map[title] = url;
    localStorage.setItem(KEY, JSON.stringify(map));
}

export function removePoster(title: string): void {
    const map = load();
    delete map[title];
    localStorage.setItem(KEY, JSON.stringify(map));
}
