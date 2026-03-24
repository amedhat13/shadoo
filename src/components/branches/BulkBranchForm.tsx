import { useState, useRef } from 'react';
import { BranchFormData } from '@/hooks/useBranches';
import { EGYPT_CITIES, getCityByName } from '@/lib/egypt-locations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Download, AlertCircle, CheckCircle, FileUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkBranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (branches: BranchFormData[]) => Promise<void>;
  isLoading?: boolean;
}

const CSV_HEADERS = ['name', 'address', 'city', 'district', 'google_maps_link'];

const SAMPLE_CSV_DATA = [
  ['Cairo Downtown Store', '123 Tahrir Square', 'Cairo', 'Downtown', 'https://maps.google.com/?q=30.0444,31.2357'],
  ['Alexandria Mall', '456 Corniche Road', 'Alexandria', 'Smouha', 'https://maps.google.com/?q=31.2001,29.9187'],
  ['Giza Plaza', '789 Pyramids Road', 'Giza', '6th of October', 'https://maps.google.com/?q=29.9773,31.1325'],
];

export function BulkBranchForm({ open, onOpenChange, onSubmit, isLoading }: BulkBranchFormProps) {
  const [parseResult, setParseResult] = useState<{
    valid: BranchFormData[];
    errors: string[];
  } | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = () => {
    const csvContent = [
      CSV_HEADERS.join(','),
      ...SAMPLE_CSV_DATA.map(row => row.map(cell => cell.includes(',') ? `"${cell}"` : cell).join(',')),
    ].join('\n');

    const bom = '\uFEFF';
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(bom + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'branches_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (content: string): { valid: BranchFormData[]; errors: string[] } => {
    const lines = content.trim().split('\n').filter(line => line.trim());
    const valid: BranchFormData[] = [];
    const errors: string[] = [];

    // Check if first line is header
    const firstLine = lines[0]?.toLowerCase();
    const hasHeader = firstLine?.includes('name') && firstLine?.includes('address');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
      const lineNumber = hasHeader ? index + 2 : index + 1;
      
      // Handle quoted CSV fields
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());
      
      if (parts.length < 4) {
        errors.push(`Line ${lineNumber}: Expected at least 4 fields (name, address, city, district, google_maps_link), got ${parts.length}.`);
        return;
      }

      const [name, address, city, district, google_maps_link] = parts;

      if (!name) {
        errors.push(`Line ${lineNumber}: Branch name is required.`);
        return;
      }
      if (!address) {
        errors.push(`Line ${lineNumber}: Address is required.`);
        return;
      }
      if (!city) {
        errors.push(`Line ${lineNumber}: City is required.`);
        return;
      }

      // Validate city exists
      const cityMatch = getCityByName(city);
      if (!cityMatch) {
        const validCities = EGYPT_CITIES.map(c => c.name).join(', ');
        errors.push(`Line ${lineNumber}: Invalid city "${city}". Valid cities: ${validCities}.`);
        return;
      }

      const link = google_maps_link || parts[4] || '';
      if (!link || (!link.includes('google.com') && !link.includes('goo.gl'))) {
        errors.push(`Line ${lineNumber}: Valid Google Maps link is required.`);
        return;
      }

      valid.push({ 
        name, 
        address, 
        city: cityMatch.name, 
        district: district || undefined, 
        google_maps_link: link 
      });
    });

    return { valid, errors };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    await onSubmit(parseResult.valid);
    handleClose();
  };

  const handleClose = () => {
    setParseResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Add Branches
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple branches at once. All branches will require verification by Shadoo admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Download Sample */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Step 1: Download Sample Template</Label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={downloadSampleCSV}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              Download and fill in the sample template with your branch data.
            </p>
          </div>

          {/* Step 2: Upload CSV */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Step 2: Upload Your CSV File</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={triggerFileInput}
              className="w-full gap-2"
            >
              <FileUp className="h-4 w-4" />
              {fileName || 'Choose CSV File'}
            </Button>
            <p className="text-xs text-muted-foreground">
              CSV format: name, address, city, district, google_maps_link.
            </p>
          </div>

          {/* Valid Cities Reference */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium mb-2">Valid Cities:</p>
            <p className="text-xs text-muted-foreground">
              {EGYPT_CITIES.map(c => c.name).join(', ')}
            </p>
          </div>

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-2">
              {parseResult.valid.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {parseResult.valid.length} branch{parseResult.valid.length > 1 ? 'es' : ''} ready to add.
                  </AlertDescription>
                </Alert>
              )}
              
              {parseResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">{parseResult.errors.length} error(s) found:</p>
                    <ul className="list-disc list-inside text-xs space-y-1 max-h-32 overflow-y-auto">
                      {parseResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <li>...and {parseResult.errors.length - 5} more errors.</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              {parseResult.valid.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-xs font-medium">
                    Preview ({parseResult.valid.length} branches)
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">City</th>
                          <th className="px-3 py-2 text-left">District</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.valid.slice(0, 5).map((branch, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{branch.name}</td>
                            <td className="px-3 py-2">{branch.city}</td>
                            <td className="px-3 py-2">{branch.district || '-'}</td>
                          </tr>
                        ))}
                        {parseResult.valid.length > 5 && (
                          <tr className="border-t">
                            <td colSpan={3} className="px-3 py-2 text-muted-foreground text-center">
                              ...and {parseResult.valid.length - 5} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !parseResult || parseResult.valid.length === 0}
          >
            {isLoading ? 'Adding...' : parseResult?.valid.length 
              ? `Add ${parseResult.valid.length} Branch${parseResult.valid.length > 1 ? 'es' : ''}`
              : 'Add Branches'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
