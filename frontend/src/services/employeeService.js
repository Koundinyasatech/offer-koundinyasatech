import apiClient from './apiService'
import { API_ENDPOINTS } from '../constants/api'

export const employeeService = {
  getAll: (params) =>
    apiClient.get(API_ENDPOINTS.GET_ALL_EMPLOYEES, { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(API_ENDPOINTS.GET_EMPLOYEE_BY_ID(id)).then((r) => r.data),

  add: (data) =>
    apiClient
      .post(API_ENDPOINTS.ADD_EMPLOYEE, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((r) => r.data),

  update: (id, data) =>
    apiClient.put(API_ENDPOINTS.UPDATE_EMPLOYEE(id), data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(API_ENDPOINTS.DELETE_EMPLOYEE(id)).then((r) => r.data),

  generateCode: () =>
    apiClient.get(API_ENDPOINTS.GENERATE_CODE).then((r) => r.data.code),

  getdesignation:()=>
    apiClient.get(API_ENDPOINTS.DESIGNATIONS).then((r)=>r.data),
}