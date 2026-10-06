import apiClient, { clearStoredSession } from './apiService'
import { API_ENDPOINTS } from '../constants/api'

export const authService = {
  login: async (Userid, code) => {
    try{
      // skipAuthRedirect: a wrong code (401) should show the error toast, not reload the page
      const res = await apiClient.post(API_ENDPOINTS.LOGIN, { Userid, code }, { skipAuthRedirect: true })
      const { token, user } = res.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(user))
    return { token, user }
    } catch (error){
      throw error
    }
  },

  // Logout this device: clear it locally right away, then end the session on the server
  logout: () => {
    const token = localStorage.getItem('authToken')
    clearStoredSession()
    if (token) {
      apiClient
        .post(API_ENDPOINTS.LOGOUT, {}, {
          headers: { Authorization: `Bearer ${token}` },
          skipAuthRedirect: true,
        })
        .catch(() => {}) // already logged out / offline — nothing more to do
    }
  },

  // Logout from every device, including this one
  logoutAll: async () => {
    const res = await apiClient.post(API_ENDPOINTS.LOGOUT_ALL)
    clearStoredSession()
    return res.data // { message, devicesLoggedOut }
  },

  // Rejects with 401 (→ apiClient redirects to /login) if this device was logged out elsewhere
  verifySession: () => apiClient.get(API_ENDPOINTS.ME).then((r) => r.data),

  getStoredUser: () => {
    const data = localStorage.getItem('userData')
    return data ? JSON.parse(data) : null
  },

  getToken: () => localStorage.getItem('authToken'),
}