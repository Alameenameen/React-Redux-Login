import axios from 'axios'

const api = axios.create({
    baseURL:import.meta.env.VITE_URL || 'http://localhost:5000',
      withCredentials: true,            // REQUIRED to send httpOnly cookies
      timeout: 10000
});

export default api; 