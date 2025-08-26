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

interface CopyConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (warehouseCode: string) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetWarehouseCode.trim()) {
      onCopy(targetWarehouseCode.trim());
      setTargetWarehouseCode(''); // Clear input after submission
    }
  };

  const handleCancel = () => {
    setTargetWarehouseCode(''); // Clear input on cancel
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Copy Configuration to Warehouse</DialogTitle>
          <DialogDescription>
            {sourceWarehouseCode 
              ? `Copy the current configuration from warehouse ${sourceWarehouseCode} to another warehouse.`
              : 'Copy the current configuration to another warehouse.'
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
              disabled={!targetWarehouseCode.trim() || isLoading}
            >
              {isLoading ? 'Copying...' : 'Copy Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}