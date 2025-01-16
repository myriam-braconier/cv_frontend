// lib/axios/huggingface.ts
import axios from 'axios';

const huggingFaceApi = axios.create({
  baseURL: 'https://api-inference.huggingface.co',
  headers: {
    'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 secondes de timeout
});

// Ajouter un intercepteur pour logger les requêtes en production
huggingFaceApi.interceptors.request.use(request => {
  console.log('Requête sortante:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
  });
  return request;
});

export default huggingFaceApi;