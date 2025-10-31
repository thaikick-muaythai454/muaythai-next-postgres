import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/database/supabase/client';
import { makeApiCall, filterBySearch, filterByStatus } from '../shared/adminUtils';
import type { Gym } from '@/types';
import { TOAST_MESSAGES } from '.';

export function useGymManagement() {
  const supabase = createClient();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load gyms from Supabase
  const loadGyms = useCallback(async () => {
    try {
      const { data: gymsData } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });

      if (gymsData) {
        setGyms(gymsData);
      }
    } catch (error) {
      console.error('Error loading gyms:', error);
      // Error handling - could add toast notification here if needed
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลยิม');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Filter gyms by status and search query
  useEffect(() => {
    let filtered = gyms;

    // Filter by status tab
    filtered = filterByStatus(filtered, selectedTab);

    // Filter by search query
    if (searchQuery) {
      const searchFields: (keyof Gym)[] = ['gym_name', 'contact_name', 'phone', 'location'];
      filtered = filterBySearch(filtered, searchQuery, searchFields);
    }

    setFilteredGyms(filtered);
  }, [gyms, selectedTab, searchQuery]);

  // Handle approve gym
  const handleApprove = async (gymId: string) => {
    setIsProcessing(true);
    const result = await makeApiCall(
      `/api/partner-applications/${gymId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      },
      TOAST_MESSAGES.APPROVE_SUCCESS
    );
    
    if (result.success) {
      await loadGyms();
    }
    
    setIsProcessing(false);
    return result.success;
  };

  // Handle reject gym
  const handleReject = async (gymId: string) => {
    setIsProcessing(true);
    const result = await makeApiCall(
      `/api/partner-applications/${gymId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'denied' }),
      },
      TOAST_MESSAGES.REJECT_SUCCESS
    );
    
    if (result.success) {
      await loadGyms();
    }
    
    setIsProcessing(false);
    return result.success;
  };

  // Handle edit gym
  const handleEdit = async (gymId: string, data: Partial<Gym>) => {
    setIsProcessing(true);
    const result = await makeApiCall(
      `/api/gyms/${gymId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      TOAST_MESSAGES.EDIT_SUCCESS
    );
    
    if (result.success) {
      await loadGyms();
    }
    
    setIsProcessing(false);
    return result.success;
  };

  // Handle delete gym
  const handleDelete = async (gymId: string) => {
    setIsProcessing(true);
    const result = await makeApiCall(
      `/api/gyms/${gymId}`,
      {
        method: 'DELETE',
      },
      TOAST_MESSAGES.DELETE_SUCCESS
    );
    
    if (result.success) {
      await loadGyms();
    }
    
    setIsProcessing(false);
    return result.success;
  };

  return {
    // State
    gyms,
    filteredGyms,
    selectedGym,
    searchQuery,
    selectedTab,
    isLoading,
    isProcessing,

    // Setters
    setSelectedGym,
    setSearchQuery,
    setSelectedTab,

    // Actions
    loadGyms,
    handleApprove,
    handleReject,
    handleEdit,
    handleDelete,
  };
}
