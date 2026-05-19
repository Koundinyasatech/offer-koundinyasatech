import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_URL, API_ENDPOINTS } from '../constants/api';

export const useDesignations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await window.fetch(`${BASE_URL}${API_ENDPOINTS.DESIGNATIONS}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

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