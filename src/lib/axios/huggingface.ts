// lib/axios/huggingface.ts
import axios from 'axios';

const huggingFaceApi = axios.create({
  baseURL: 'https://api-inference.huggingface.co',
  headers: {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
  },
});

export default huggingFaceApi;