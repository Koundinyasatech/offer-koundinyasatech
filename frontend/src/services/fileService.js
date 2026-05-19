
import apiClient from './apiService'
import { API_ENDPOINTS } from '../constants/api'

export const fileService = {

  // ✅ FIX 2: Changed POST with body → GET with query param to match backend
  // Backend: GET /api/employees/GetFiles?Empid=294640
  getByEmployee: (empId) =>
    apiClient
      .get(API_ENDPOINTS.GET_FILES_BY_EMPLOYEE, { params: { Empid: empId } })
      .then((r) => r.data),

  upload: (empId, file) => {
    const form = new FormData()
    form.append('employeeId', empId)
    form.append('file', file)
    return apiClient
      .post(API_ENDPOINTS.UPLOAD_FILE, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // Opens PDF in new browser tab
  viewPdf: async (fileId) => {
    const res = await apiClient.get(API_ENDPOINTS.VIEW_FILE(fileId), {
      responseType: 'blob',
    })
    const blob    = new Blob([res.data], { type: 'application/pdf' })
    const blobUrl = window.URL.createObjectURL(blob)
    const tab     = window.open(blobUrl, '_blank')
    if (!tab) {
      const a = document.createElement('a')
      a.href = blobUrl; a.target = '_blank'; a.rel = 'noopener noreferrer'
      document.body.appendChild(a); a.click(); a.remove()
    }
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000)
  },

  // Downloads PDF to device
  download: async (fileId, fileName) => {
    const res = await apiClient.get(API_ENDPOINTS.VIEW_FILE(fileId), {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a   = document.createElement('a')
    a.href = url; a.download = fileName || `file_${empId}.pdf`
    document.body.appendChild(a); a.click(); a.remove()
    window.URL.revokeObjectURL(url)
  },
}