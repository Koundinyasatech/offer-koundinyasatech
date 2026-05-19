import apiClient from './apiService'
import { API_ENDPOINTS } from '../constants/api'

export const authService = {
  login: async (Userid, code) => {
    try{
      const res = await apiClient.post(API_ENDPOINTS.LOGIN, { Userid, code })
      console.log(res.data)
      const { token, user } = res.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(user))
    return { token, user }
    } catch (error){
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  },

  getStoredUser: () => {
    const data = localStorage.getItem('userData')
    return data ? JSON.parse(data) : null
  },

  getToken: () => localStorage.getItem('authToken'),
}