// lib/axios/freepik.ts
import axios from 'axios';

const freepikApi = axios.create({
  baseURL: 'https://api.freepik.com/v1/ai', // base URL Freepik AI image generation
  headers: {
    'x-freepik-api-key': process.env.FREEPIK_API_KEY || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60 secondes de timeout
});

// Optionnel : intercepteur pour logger les requêtes (en dev ou prod)
freepikApi.interceptors.request.use((request) => {
  console.log('Requête sortante Freepik:', {
    url: request.url,
    method: request.method,
    headers: {
      ...request.headers,
      'x-freepik-api-key': '****', // cacher la clé dans logs
    },
    data: request.data,
  });
  return request;
});

export default freepikApi;
