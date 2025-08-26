import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FetchConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetch: (warehouseCode: string) => void;
  isLoading?: boolean;
}

export default function FetchConfigurationDialog({
  open,
  onOpenChange,
  onFetch,
  isLoading = false
}: FetchConfigurationDialogProps) {
  const [warehouseCode, setWarehouseCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouseCode.trim()) {
      onFetch(warehouseCode.trim());
      setWarehouseCode(''); // Clear input after submission
    }
  };

  const handleCancel = () => {
    setWarehouseCode(''); // Clear input on cancel
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
              disabled={!warehouseCode.trim() || isLoading}
            >
              {isLoading ? 'Fetching...' : 'Fetch Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}