export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '')
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8000'
  }

  return 'https://jiehao-fyp-final.onrender.com'
}

