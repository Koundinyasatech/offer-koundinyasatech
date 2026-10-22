// src/services/ctcService.js
import apiClient from './apiService';
import { API_ENDPOINTS } from '../constants/api';

export const ctcService = {
  /**
   * Verifies the CTC password on the server and returns a map
   * of { [empId]: ctc | null }. Rejects with 403 on a wrong password.
   */
  unlock: (password) =>
    apiClient.post(API_ENDPOINTS.CTC_UNLOCK, { password }).then(res => res.data.ctc),
};