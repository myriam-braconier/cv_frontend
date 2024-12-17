import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // L'URL de base de l'api rest 
  timeout: 4000, // Timeout en millisecondes
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
