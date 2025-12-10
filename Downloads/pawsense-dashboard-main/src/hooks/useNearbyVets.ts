import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';

export interface NearbyVet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  distance?: string;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  specialty?: string;
  available?: boolean;
}

export function useNearbyVets(location: [number, number] | null | undefined) {
  const [vets, setVets] = useState<NearbyVet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVets() {
      if (!location || location.length !== 2) return;
      const [lat, lng] = location;
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get('/api/locations/nearby-vets', {
          params: { latitude: lat, longitude: lng },
        });
        setVets(res.data || []);
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(apiErr.response?.data?.error || apiErr.message || 'Failed to fetch nearby vets');
        setVets([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVets();
  }, [location]);

  return { vets, loading, error };
}
