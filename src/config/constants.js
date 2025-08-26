export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://cvbackend-production-302b.up.railway.app'
    : 'http://localhost:4000'
  );