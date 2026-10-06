import axios from 'axios'
import { BASE_URL } from '../constants/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const clearStoredSession = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userData')
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    // Don't overwrite a token that was set explicitly on the request (used by logout)
    if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 — session expired or was logged out from another device ("Logout all devices"):
// clear it and redirect to login. Requests sent with { skipAuthRedirect: true } handle 401 themselves.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      clearStoredSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient