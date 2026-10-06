import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { employeeService } from '../services/employeeService';

export const useDesignations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Through apiClient so the login token is sent (this API now requires login)
        const data = await employeeService.getdesignation();

        // Map backend docs to { label, value } for AppSelect
        const options = [
          { label: 'Select', value: '' },
          ...data.map(d => ({ label: d.Role, value: d.Role }))
        ];
        setDesignations(options);
      } catch {
        toast.error('Failed to load designations');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { designations, loading };
};