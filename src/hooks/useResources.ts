import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  title: string;
  title_ar: string;
  thumbnail_url: string | null;
  mega_link: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export function useResources(categoryId?: string, limit?: number) {
  return useQuery({
    queryKey: ['resources', categoryId, limit],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Resource[];
    },
  });
}

export function useLatestResources() {
  return useResources(undefined, 6);
}
