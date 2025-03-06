import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { toast } from 'sonner';

// Generic data fetching hook
export function useBusinessData<T>(
  fetchFunction: (businessId: string) => Promise<T[]>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.businessId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchFunction(user.businessId);
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, ...dependencies]);

  return { data, isLoading, error, refetch: () => setIsLoading(true) };
}