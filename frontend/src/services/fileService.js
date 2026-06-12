import apiClient from './apiService'
import { API_ENDPOINTS } from '../constants/api'

export const fileService = {

  /* Get all files metadata for an employee (no binary) */
  getByEmployee: (empId) =>
    apiClient
      .get(API_ENDPOINTS.GET_FILES_BY_EMPLOYEE, { params: { Empid: empId } })
      .then((r) => r.data),

  /* Get all files list by empId — uses new list endpoint */
  getFilesList: (empId) =>
    apiClient
      .get(`/api/viewpdf/list/${empId}`)
      .then((r) => r.data),

  /* Upload file */
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

  /* View a specific file by MongoDB _id — opens in new tab */
  viewPdf: async (fileId) => {
    const res = await apiClient.get(`/api/viewpdf/${fileId}`, {
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

  /* Download a specific file by MongoDB _id */
  download: async (fileId, fileName) => {
    const res = await apiClient.get(`/api/files/download/${fileId}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a   = document.createElement('a')
    a.href     = url
    a.download = fileName || 'document.pdf'
    document.body.appendChild(a); a.click(); a.remove()
    window.URL.revokeObjectURL(url)
  },
}