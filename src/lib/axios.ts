import axios from 'axios';

const username = process.env.NEXT_PUBLIC_API_USERNAME ?? '';
const password = process.env.NEXT_PUBLIC_API_PASSWORD ?? '';
const token = Buffer.from(`${username}:${password}`).toString('base64');

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${token}`,
    },
});

export default apiClient;
