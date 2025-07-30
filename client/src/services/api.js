import axios from 'axios'

export const api = axios.create({
  // Base URL is proxied by Vite during dev.
  // In production, set REACT_APP_API_URL or similar as needed.
})
