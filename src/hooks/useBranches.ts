import { useState, useCallback } from 'react';
import { Branch, BranchStatus } from '@/types';

// Mock branches data
const initialBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Cairo Downtown',
    address: '123 Tahrir Square',
    city: 'Cairo',
    district: 'Downtown',
    google_maps_link: 'https://maps.google.com/?q=30.0444,31.2357',
    latitude: 30.0444,
    longitude: 31.2357,
    status: 'verified',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'branch-2',
    name: 'Alexandria Mall',
    address: '456 Corniche Road',
    city: 'Alexandria',
    district: 'Smouha',
    google_maps_link: 'https://maps.google.com/?q=31.2001,29.9187',
    latitude: 31.2001,
    longitude: 29.9187,
    status: 'verified',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'branch-3',
    name: 'Giza Plaza',
    address: '789 Pyramids Road',
    city: 'Giza',
    district: '6th of October',
    google_maps_link: 'https://maps.google.com/?q=29.9773,31.1325',
    latitude: 29.9773,
    longitude: 31.1325,
    status: 'pending_verification',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'branch-4',
    name: 'Maadi Branch',
    address: 'Road 9, Maadi',
    city: 'Cairo',
    district: 'Maadi',
    google_maps_link: 'https://maps.google.com/?q=29.9602,31.2569',
    latitude: 29.9602,
    longitude: 31.2569,
    status: 'rejected',
    rejection_reason: 'Address verification failed - please provide correct location.',
    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-01-26T10:00:00Z',
  },
];

export interface BranchFormData {
  name: string;
  address: string;
  city: string;
  district?: string;
  google_maps_link: string;
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isLoading, setIsLoading] = useState(false);

  const getBranch = useCallback((id: string) => {
    return branches.find((b) => b.id === id);
  }, [branches]);

  const getVerifiedBranches = useCallback(() => {
    return branches.filter((b) => b.status === 'verified');
  }, [branches]);

  const createBranch = useCallback(async (data: BranchFormData): Promise<Branch> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Extract coordinates from Google Maps link if possible
    const coords = extractCoordsFromLink(data.google_maps_link);

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      name: data.name,
      address: data.address,
      city: data.city,
      district: data.district,
      google_maps_link: data.google_maps_link,
      latitude: coords?.lat,
      longitude: coords?.lng,
      status: 'pending_verification', // Always starts as pending
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBranches((prev) => [newBranch, ...prev]);
    setIsLoading(false);
    return newBranch;
  }, []);

  const createBulkBranches = useCallback(async (dataList: BranchFormData[]): Promise<Branch[]> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newBranches: Branch[] = dataList.map((data, index) => {
      const coords = extractCoordsFromLink(data.google_maps_link);
      return {
        id: `branch-${Date.now()}-${index}`,
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        google_maps_link: data.google_maps_link,
        latitude: coords?.lat,
        longitude: coords?.lng,
        status: 'pending_verification' as BranchStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    setBranches((prev) => [...newBranches, ...prev]);
    setIsLoading(false);
    return newBranches;
  }, []);

  const updateBranch = useCallback(async (id: string, data: Partial<BranchFormData>): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setBranches((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        
        const newLink = data.google_maps_link || b.google_maps_link;
        const coords = extractCoordsFromLink(newLink);
        
        return {
          ...b,
          ...data,
          latitude: coords?.lat ?? b.latitude,
          longitude: coords?.lng ?? b.longitude,
          // Reset to pending if edited
          status: 'pending_verification' as BranchStatus,
          updated_at: new Date().toISOString(),
        };
      })
    );
    setIsLoading(false);
  }, []);

  const deleteBranch = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBranches((prev) => prev.filter((b) => b.id !== id));
    setIsLoading(false);
  }, []);

  return {
    branches,
    isLoading,
    getBranch,
    getVerifiedBranches,
    createBranch,
    createBulkBranches,
    updateBranch,
    deleteBranch,
  };
}

// Helper to extract coordinates from Google Maps link
function extractCoordsFromLink(link: string): { lat: number; lng: number } | null {
  try {
    // Try format: ?q=lat,lng
    const qMatch = link.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }
    
    // Try format: @lat,lng
    const atMatch = link.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }
    
    return null;
  } catch {
    return null;
  }
}
