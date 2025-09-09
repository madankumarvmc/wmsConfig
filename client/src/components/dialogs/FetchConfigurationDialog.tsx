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

interface FetchConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetch: (warehouseCode: string, environment: Environment) => void;
  isLoading?: boolean;
}

export default function FetchConfigurationDialog({
  open,
  onOpenChange,
  onFetch,
  isLoading = false
}: FetchConfigurationDialogProps) {
  const [warehouseCode, setWarehouseCode] = useState('');
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [hasUserSelectedEnvironment, setHasUserSelectedEnvironment] = useState(false);

  // Auto-populate saved environment when warehouse code changes (only if user hasn't manually selected one)
  useEffect(() => {
    if (warehouseCode.trim() && !hasUserSelectedEnvironment) {
      const savedEnvironment = warehouseEnvironmentManager.getEnvironment(warehouseCode.trim());
      if (savedEnvironment) {
        setEnvironment(savedEnvironment);
      }
    }
  }, [warehouseCode, hasUserSelectedEnvironment]);

  // Handle manual environment selection
  const handleEnvironmentChange = (value: string) => {
    setEnvironment(value as Environment);
    setHasUserSelectedEnvironment(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouseCode.trim() && environment) {
      // Save the environment mapping
      warehouseEnvironmentManager.setEnvironment(warehouseCode.trim(), environment);
      
      onFetch(warehouseCode.trim(), environment);
      setWarehouseCode(''); // Clear input after submission
      setEnvironment(null); // Reset environment
      setHasUserSelectedEnvironment(false); // Reset user selection flag
    }
  };

  const handleCancel = () => {
    setWarehouseCode(''); // Clear input on cancel
    setEnvironment(null); // Reset environment
    setHasUserSelectedEnvironment(false); // Reset user selection flag
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Fetch Configuration of Warehouse</DialogTitle>
          <DialogDescription>
            Enter the warehouse code to fetch its current configuration data.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
              <Label htmlFor="warehouse-code">
                Warehouse Code
              </Label>
              <Input
                id="warehouse-code"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value)}
                placeholder="Enter warehouse code"
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            {warehouseCode && environment && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                API: cincout.{environment}.api.staging.stackbox.internal
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
              disabled={!warehouseCode.trim() || !environment || isLoading}
            >
              {isLoading ? 'Fetching...' : 'Fetch Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}