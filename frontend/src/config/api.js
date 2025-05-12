// API Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ontask.onrender.com' 
  : 'http://localhost:4006';

export default API_URL;