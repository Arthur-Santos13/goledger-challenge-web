import axios from 'axios';

const username = process.env.NEXT_PUBLIC_API_USERNAME ?? '';
const password = process.env.NEXT_PUBLIC_API_PASSWORD ?? '';
const token = Buffer.from(`${username}:${password}`).toString('base64');

// In the browser, use the local proxy path (/api-proxy) so that HTTPS Vercel
// forwards the request server-side to the HTTP API, avoiding mixed-content blocks.
// Server-side (SSR / build), fall back to the absolute URL directly.
const baseURL =
    typeof window !== 'undefined' ? '/api-proxy' : (process.env.NEXT_PUBLIC_API_URL ?? '');

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
    },
});

export default apiClient;
