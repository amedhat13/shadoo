import { Branch } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BranchStatusBadge } from './BranchStatusBadge';
import { X, ExternalLink, MapPin } from 'lucide-react';

interface BranchMapViewProps {
  branches: Branch[];
  selectedBranch?: Branch | null;
  onSelectBranch: (branch: Branch | null) => void;
}

export function BranchMapView({ branches, selectedBranch, onSelectBranch }: BranchMapViewProps) {
  // Default center on Egypt
  const defaultCenter = { lat: 30.0444, lng: 31.2357 };
  
  // If a branch is selected, center on it
  const center = selectedBranch && selectedBranch.latitude && selectedBranch.longitude
    ? { lat: selectedBranch.latitude, lng: selectedBranch.longitude }
    : defaultCenter;

  // Create Google Maps embed URL
  const getEmbedUrl = () => {
    if (selectedBranch && selectedBranch.latitude && selectedBranch.longitude) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedBranch.latitude},${selectedBranch.longitude}&zoom=15`;
    }
    // Show all of Egypt when no branch selected
    return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${center.lat},${center.lng}&zoom=6`;
  };

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Map View
          </span>
          {selectedBranch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectBranch(null)}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Selected Branch Info */}
        {selectedBranch && (
          <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
            <div>
              <p className="font-medium">{selectedBranch.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedBranch.address}, {selectedBranch.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BranchStatusBadge status={selectedBranch.status} />
              <a
                href={selectedBranch.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in Maps
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Map */}
        <div className="relative w-full h-[400px] bg-muted">
          <iframe
            title="Branch Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={getEmbedUrl()}
          />
        </div>

        {/* Branch List Quick Select */}
        {branches.length > 0 && !selectedBranch && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Click on a branch in the table or select from the list below:
            </p>
            <div className="flex flex-wrap gap-2">
              {branches.slice(0, 6).map((branch) => (
                <Button
                  key={branch.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectBranch(branch)}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {branch.name}
                </Button>
              ))}
              {branches.length > 6 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{branches.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
