import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseData<T>(
  table: string,
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id);

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      const { data: result, error } = await query;

      if (error) {
        throw error;
      }

      setData(result || []);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, table]);

  const insert = async (item: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(table)
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;

    setData(prev => [data, ...prev]);
    return data;
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from(table)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    setData(prev => prev.map(item => 
      (item as any).id === id ? data : item
    ));
    return data;
  };

  const remove = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setData(prev => prev.filter(item => (item as any).id !== id));
  };

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    refetch: fetchData
  };
}