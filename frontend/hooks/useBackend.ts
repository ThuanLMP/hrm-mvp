import { useMemo } from 'react';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';

export function useBackend() {
  const { token } = useAuth();
  
  return useMemo(() => {
    // For now, just return the backend client directly
    // Authentication will be handled later when auth is set up
    return backend;
  }, [token]);
}
