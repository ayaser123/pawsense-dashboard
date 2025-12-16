import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api';

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  age?: number;
  gender?: string;
  created_at: string;
  updated_at: string;
}

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  addPet: (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Pet | null>;
  updatePet: (id: string, updates: Partial<Pet>) => Promise<Pet | null>;
  deletePet: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function usePets(): UsePetsResult {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    if (!user) {
      setPets([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/pets');
      setPets(response.data || []);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(apiErr.response?.data?.error || 'Failed to fetch pets');
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const addPet = async (petData: Omit<Pet, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Promise<Pet | null> => {
    try {
      setError(null);
      console.log("[usePets] Adding pet with data:", petData);
      const response = await apiClient.post('/api/pets', petData);
      console.log("[usePets] Pet added successfully, response:", response.data);
      setPets([...pets, response.data]);
      return response.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string; details?: string; code?: string } }; message?: string };
      const errorMsg = apiErr.response?.data?.error || 'Failed to add pet';
      console.error("[usePets] Error adding pet:", {
        message: errorMsg,
        details: apiErr.response?.data?.details,
        code: apiErr.response?.data?.code,
        fullError: err
      });
      setError(errorMsg);
      return null;
    }
  };

  const updatePet = async (id: string, updates: Partial<Pet>): Promise<Pet | null> => {
    try {
      setError(null);
      const response = await apiClient.put(`/api/pets/${id}`, updates);
      setPets(pets.map((p) => (p.id === id ? response.data : p)));
      return response.data;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = apiErr.response?.data?.error || 'Failed to update pet';
      setError(errorMsg);
      return null;
    }
  };

  const deletePet = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await apiClient.delete(`/api/pets/${id}`);
      setPets(pets.filter((p) => p.id !== id));
      return true;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = apiErr.response?.data?.error || 'Failed to delete pet';
      setError(errorMsg);
      return false;
    }
  };

  const refetch = async () => {
    await fetchPets();
  };

  return {
    pets,
    loading,
    error,
    addPet,
    updatePet,
    deletePet,
    refetch,
  };
}
