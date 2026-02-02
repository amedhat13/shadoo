import { useState, useEffect } from 'react';
import { Branch } from '@/types';
import { BranchFormData } from '@/hooks/useBranches';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Link as LinkIcon } from 'lucide-react';

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
  onSubmit: (data: BranchFormData) => Promise<void>;
  isLoading?: boolean;
}

const initialFormState: BranchFormData = {
  name: '',
  address: '',
  city: '',
  google_maps_link: '',
};

export function BranchForm({ open, onOpenChange, branch, onSubmit, isLoading }: BranchFormProps) {
  const [formData, setFormData] = useState<BranchFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<BranchFormData>>({});

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        city: branch.city,
        google_maps_link: branch.google_maps_link,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [branch, open]);

  const validate = (): boolean => {
    const newErrors: Partial<BranchFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.google_maps_link.trim()) {
      newErrors.google_maps_link = 'Google Maps link is required';
    } else if (!formData.google_maps_link.includes('google.com/maps') && !formData.google_maps_link.includes('maps.google.com') && !formData.google_maps_link.includes('goo.gl/maps')) {
      newErrors.google_maps_link = 'Please enter a valid Google Maps link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </DialogTitle>
          <DialogDescription>
            {branch 
              ? 'Update branch details. Changes will require re-verification by Shadoo admin.'
              : 'Add a new branch location. It will be verified by Shadoo admin before it can be used in missions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Cairo Downtown"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="e.g., 123 Main Street"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Cairo"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="google_maps_link" className="flex items-center gap-2">
              <LinkIcon className="h-3 w-3" />
              Google Maps Link *
            </Label>
            <Input
              id="google_maps_link"
              placeholder="https://maps.google.com/..."
              value={formData.google_maps_link}
              onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
            />
            {errors.google_maps_link && <p className="text-xs text-destructive">{errors.google_maps_link}</p>}
            <p className="text-xs text-muted-foreground">
              Open Google Maps, find your location, and copy the share link
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : branch ? 'Update Branch' : 'Add Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
