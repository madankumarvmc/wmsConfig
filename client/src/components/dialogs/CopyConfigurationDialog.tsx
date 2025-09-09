import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ENVIRONMENTS, type Environment, warehouseEnvironmentManager } from '@/lib/environmentUtils';

interface CopyConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (targetWarehouseCode: string, environment: Environment) => void;
  sourceWarehouseCode?: string;
  isLoading?: boolean;
}

export default function CopyConfigurationDialog({
  open,
  onOpenChange,
  onCopy,
  sourceWarehouseCode,
  isLoading = false
}: CopyConfigurationDialogProps) {
  const [targetWarehouseCode, setTargetWarehouseCode] = useState('');
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [hasUserSelectedEnvironment, setHasUserSelectedEnvironment] = useState(false);

  // Auto-populate saved environment when target warehouse code changes (only if user hasn't manually selected one)
  useEffect(() => {
    if (targetWarehouseCode.trim() && !hasUserSelectedEnvironment) {
      const savedEnvironment = warehouseEnvironmentManager.getEnvironment(targetWarehouseCode.trim());
      if (savedEnvironment) {
        setEnvironment(savedEnvironment);
      }
    }
  }, [targetWarehouseCode, hasUserSelectedEnvironment]);

  // Handle manual environment selection
  const handleEnvironmentChange = (value: string) => {
    setEnvironment(value as Environment);
    setHasUserSelectedEnvironment(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetWarehouseCode.trim() && environment) {
      // Save the environment mapping
      warehouseEnvironmentManager.setEnvironment(targetWarehouseCode.trim(), environment);
      
      onCopy(targetWarehouseCode.trim(), environment);
      setTargetWarehouseCode(''); // Clear input after submission
      setEnvironment(null); // Reset environment
      setHasUserSelectedEnvironment(false); // Reset user selection flag
    }
  };

  const handleCancel = () => {
    setTargetWarehouseCode(''); // Clear input on cancel
    setEnvironment(null); // Reset environment
    setHasUserSelectedEnvironment(false); // Reset user selection flag
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Copy Configuration to Warehouse</DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'Copying configurations... This may take a few moments.'
              : sourceWarehouseCode 
                ? `Copy the current configuration (including any modifications) from warehouse ${sourceWarehouseCode} to another warehouse environment.`
                : 'Copy the current configuration to another warehouse environment.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {sourceWarehouseCode && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  From Warehouse
                </Label>
                <div className="text-sm font-medium text-gray-800 bg-gray-100 p-2 rounded border">
                  {sourceWarehouseCode}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="environment">
                Select Environment
              </Label>
              <Select
                value={environment || ''}
                onValueChange={handleEnvironmentChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose environment" />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-warehouse-code">
                To Warehouse
              </Label>
              <Input
                id="target-warehouse-code"
                value={targetWarehouseCode}
                onChange={(e) => setTargetWarehouseCode(e.target.value)}
                placeholder="Enter target warehouse code"
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            {targetWarehouseCode && environment && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                Target API: cincout.{environment}.api.staging.stackbox.internal
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!targetWarehouseCode.trim() || !environment || isLoading}
              className={isLoading ? 'animate-pulse' : ''}
            >
              {isLoading ? 'Copying Configuration...' : 'Copy Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}