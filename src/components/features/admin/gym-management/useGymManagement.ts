import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
  const [isExporting, setIsExporting] = useState(false);

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

  // Generic handler for API operations with loading state
  const handleApiOperation = async (
    url: string,
    options: RequestInit,
    successMessage: string
  ) => {
    setIsProcessing(true);
    const result = await makeApiCall(url, options, successMessage);
    if (result.success) await loadGyms();
    setIsProcessing(false);
    return result.success;
  };

  // Handle approve gym
  const handleApprove = (gymId: string) =>
    handleApiOperation(
      `/api/partner-applications/${gymId}`,
      { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) },
      TOAST_MESSAGES.APPROVE_SUCCESS
    );

  // Handle reject gym
  const handleReject = (gymId: string) =>
    handleApiOperation(
      `/api/partner-applications/${gymId}`,
      { method: 'PATCH', body: JSON.stringify({ status: 'denied' }) },
      TOAST_MESSAGES.REJECT_SUCCESS
    );

  // Handle edit gym
  const handleEdit = (gymId: string, data: Partial<Gym>) =>
    handleApiOperation(
      `/api/gyms/${gymId}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      TOAST_MESSAGES.EDIT_SUCCESS
    );

  // Handle delete gym
  const handleDelete = (gymId: string) =>
    handleApiOperation(
      `/api/gyms/${gymId}`,
      { method: 'DELETE' },
      TOAST_MESSAGES.DELETE_SUCCESS
    );

  const exportGyms = useCallback(async () => {
    if (!filteredGyms.length) {
      toast.error('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const escapeCsvValue = (value: unknown) => {
      if (value === null || value === undefined) {
        return '""';
      }
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    setIsExporting(true);

    try {
      const headers = [
        'ชื่อยิม',
        'ผู้ติดต่อ',
        'โทรศัพท์',
        'อีเมล',
        'สถานที่',
        'สถานะ',
        'วันที่สร้าง',
      ];

      const rows = filteredGyms.map((gym) => [
        escapeCsvValue(gym.gym_name),
        escapeCsvValue(gym.contact_name),
        escapeCsvValue(gym.phone),
        escapeCsvValue(gym.email),
        escapeCsvValue(gym.location),
        escapeCsvValue(gym.status),
        escapeCsvValue(
          gym.created_at ? new Date(gym.created_at).toLocaleString('th-TH') : '-'
        ),
      ]);

      const csvContent = [headers.map(escapeCsvValue).join(','), ...rows.map((row) => row.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `gym-management-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('ส่งออกข้อมูลยิมสำเร็จ');
    } catch (error) {
      console.error('Error exporting gyms:', error);
      toast.error('ไม่สามารถส่งออกข้อมูลได้');
    } finally {
      setIsExporting(false);
    }
  }, [filteredGyms]);

  return {
    // State
    gyms,
    filteredGyms,
    selectedGym,
    searchQuery,
    selectedTab,
    isLoading,
    isProcessing,
    isExporting,

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
    exportGyms,
  };
}
