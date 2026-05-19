
export const BASE_URL = 'https://offer-kts.onrender.com/api'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',

  // Employees
  GET_ALL_EMPLOYEES:  '/employees',
  GET_EMPLOYEE_BY_ID: (id) => `/employees/${id}`,
  ADD_EMPLOYEE:       '/employees/add',
  UPDATE_EMPLOYEE:    (id) => `/employees/update/${id}`,
  DELETE_EMPLOYEE:    (id) => `/employees/delete/${id}`,
  GENERATE_CODE:      '/employees/generate-code',

  GET_FILES_BY_EMPLOYEE: '/employees/GetFiles',
  VIEW_FILE:             (id) => `/viewpdf/${id}`,
  UPLOAD_FILE:           '/files/upload',
  DOWNLOAD_FILE:         (id) => `/files/download/${id}`,

  DESIGNATIONS: '/Designation',
}




export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]