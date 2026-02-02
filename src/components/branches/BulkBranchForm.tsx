import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkBranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (branches: BranchFormData[]) => Promise<void>;
  isLoading?: boolean;
}

const EXAMPLE_CSV = `Cairo Downtown,123 Tahrir Square,Cairo,https://maps.google.com/?q=30.0444,31.2357
Alexandria Mall,456 Corniche Road,Alexandria,https://maps.google.com/?q=31.2001,29.9187
Giza Plaza,789 Pyramids Road,Giza,https://maps.google.com/?q=29.9773,31.1325`;

export function BulkBranchForm({ open, onOpenChange, onSubmit, isLoading }: BulkBranchFormProps) {
  const [csvInput, setCsvInput] = useState('');
  const [parseResult, setParseResult] = useState<{
    valid: BranchFormData[];
    errors: string[];
  } | null>(null);

  const parseCSV = (input: string): { valid: BranchFormData[]; errors: string[] } => {
    const lines = input.trim().split('\n').filter(line => line.trim());
    const valid: BranchFormData[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 4) {
        errors.push(`Line ${index + 1}: Expected 4 fields (name, address, city, google_maps_link), got ${parts.length}`);
        return;
      }

      const [name, address, city, google_maps_link] = parts;

      if (!name) {
        errors.push(`Line ${index + 1}: Branch name is required`);
        return;
      }
      if (!address) {
        errors.push(`Line ${index + 1}: Address is required`);
        return;
      }
      if (!city) {
        errors.push(`Line ${index + 1}: City is required`);
        return;
      }
      if (!google_maps_link || (!google_maps_link.includes('google.com') && !google_maps_link.includes('goo.gl'))) {
        errors.push(`Line ${index + 1}: Valid Google Maps link is required`);
        return;
      }

      valid.push({ name, address, city, google_maps_link });
    });

    return { valid, errors };
  };

  const handlePreview = () => {
    const result = parseCSV(csvInput);
    setParseResult(result);
  };

  const handleSubmit = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    await onSubmit(parseResult.valid);
    setCsvInput('');
    setParseResult(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setCsvInput('');
    setParseResult(null);
    onOpenChange(false);
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
            Add multiple branches at once using CSV format. All branches will require verification by Shadoo admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CSV Format</Label>
            <p className="text-xs text-muted-foreground">
              Each line should contain: <code className="bg-muted px-1 rounded">name, address, city, google_maps_link</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-input">Paste your CSV data</Label>
            <Textarea
              id="csv-input"
              placeholder={EXAMPLE_CSV}
              value={csvInput}
              onChange={(e) => {
                setCsvInput(e.target.value);
                setParseResult(null);
              }}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {parseResult && (
            <div className="space-y-2">
              {parseResult.valid.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {parseResult.valid.length} branch{parseResult.valid.length > 1 ? 'es' : ''} ready to add
                  </AlertDescription>
                </Alert>
              )}
              
              {parseResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">{parseResult.errors.length} error(s) found:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {parseResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <li>...and {parseResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium mb-2">Example:</p>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {EXAMPLE_CSV}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!parseResult ? (
            <Button onClick={handlePreview} disabled={!csvInput.trim()}>
              Preview
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || parseResult.valid.length === 0}
            >
              {isLoading ? 'Adding...' : `Add ${parseResult.valid.length} Branch${parseResult.valid.length > 1 ? 'es' : ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
