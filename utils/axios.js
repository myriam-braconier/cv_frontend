import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000', // L'URL de base de votre API
  timeout: 4000, // Timeout en millisecondes
  headers: {'X-Custom-Header': 'foobar'}
});

export default instance;
