import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'

export const useEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [total,     setTotal]     = useState(0)

  const fetchEmployees = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const data = await employeeService.getAll(params)
      if (Array.isArray(data)) {
        setEmployees(data)
        setTotal(data.length)
      } else {
        setEmployees(data.employees || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [])

  return { employees, loading, total, fetchEmployees }
}