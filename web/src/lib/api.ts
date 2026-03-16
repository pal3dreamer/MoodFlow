import axios from 'axios';

// On mobile/Capacitor, the origin is not the same as the backend server
// For local development, we should use the machine's IP address rather than localhost
// when testing on a real Android device.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
