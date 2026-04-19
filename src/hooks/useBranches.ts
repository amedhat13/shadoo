import { useState, useCallback } from 'react';
import { Branch, BranchStatus } from '@/types';

// Mock branches data — aligned with T-Lab demo (2 verified branches)
const initialBranches: Branch[] = [
  {
    id: '10ee937e-ccf1-4e76-9e3d-60bc47548fb8',
    name: 'T-Lab Boba — The Yard',
    name_ar: 'تي-لاب بوبا — ذا يارد',
    address: 'The Yard, New Cairo',
    address_ar: 'ذا يارد، القاهرة الجديدة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=30.0285,31.4915',
    latitude: 30.0285,
    longitude: 31.4915,
    status: 'verified',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
  {
    id: '74258ceb-35e1-4510-bd1d-d4f0fa1c04e0',
    name: 'T-Lab Boba — Arabella',
    name_ar: 'تي-لاب بوبا — أرابيلا',
    address: 'Arabella Plaza, New Cairo',
    address_ar: 'أرابيلا بلازا، القاهرة الجديدة',
    city: 'Cairo',
    district: 'New Cairo',
    google_maps_link: 'https://maps.google.com/?q=30.0185,31.4710',
    latitude: 30.0185,
    longitude: 31.4710,
    status: 'verified',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];

export interface BranchFormData {
  name: string;
  name_ar?: string;
  address: string;
  address_ar?: string;
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
