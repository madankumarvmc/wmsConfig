import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Save, User, ChevronDown, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import sbxLogo from '@assets/sbx_logo.png';

interface TopNavbarButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface TopNavbarProps {
  leftButtons?: TopNavbarButton[];
  rightButtons?: TopNavbarButton[];
}

export default function TopNavbar({ leftButtons = [], rightButtons = [] }: TopNavbarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { state, dispatch } = useWizard();
  const { fetchConfigurations, isLoading } = useFetchedConfigurations();
  const [warehouseCode, setWarehouseCode] = useState(state.warehouseCode || '');

  const handleWarehouseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarehouseCode(e.target.value);
  };

  const handleFetchConfigurations = async () => {
    if (!warehouseCode.trim()) {
      toast({
        title: 'Warehouse Code Required',
        description: 'Please enter a warehouse code to fetch configurations.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Example API endpoints - you'll need to replace these with your actual endpoints
      const apiEndpoints = {
        lineSplit: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/strategy/outbound/line-split/query?whId={warehouseCode}',
        taskSequences: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/strategy/outbound/task-sequence/query?whId={warehouseCode}',
        taskStrategy: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/task_strategy/query?whId={warehouseCode}',
        binSearch: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/task-strategy/bin-search/query?whId={warehouseCode}',
      };

      console.log('Fetching configurations for warehouse code:', warehouseCode);
      
      // Use the new FetchedConfigurationsContext to fetch and auto-populate
      await fetchConfigurations(warehouseCode, apiEndpoints);
      
      // Save warehouse code to wizard context
      dispatch({ type: 'SET_WAREHOUSE_CODE', payload: warehouseCode });
      
      toast({
        title: 'Configurations Fetched & Auto-Populated',
        description: `Successfully fetched and populated configurations for warehouse ${warehouseCode}`,
      });

    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: 'Fetch Failed',
        description: 'Failed to fetch configurations. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportOutboundConfig = async () => {
    try {
      const response = await fetch('/api/export/outbound');
      if (!response.ok) {
        throw new Error('Failed to export configuration');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `outbound-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: 'Outbound configuration exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export outbound configuration.',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav id="top-navbar" className="bg-slate-800 border-b border-slate-700 px-6 shadow-sm h-[72px] flex items-center flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img 
              id="sbx-logo"
              src={sbxLogo} 
              alt="SBX Logo" 
              className="w-8 h-8 rounded flex-shrink-0"
            />
            <h1 className="text-xl font-medium text-white whitespace-nowrap">SBX Warehouse Configuration Portal</h1>
          </div>

          {/* Warehouse Code Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-300 whitespace-nowrap">Warehouse Code:</label>
              <Input
                id="warehouse-code-input"
                type="text"
                value={warehouseCode}
                onChange={handleWarehouseCodeChange}
                placeholder="Enter warehouse code"
                className="w-40 h-8 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="actions-dropdown-trigger"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 disabled:opacity-50"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  {isLoading ? 'Fetching...' : 'Actions'}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent id="actions-dropdown-content" className="bg-slate-800 border-slate-600">
                <DropdownMenuItem 
                  id="fetch-configurations-item"
                  onClick={handleFetchConfigurations}
                  disabled={isLoading}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isLoading ? 'Fetching Configurations...' : 'Fetch Configurations'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Left navigation buttons */}
          {leftButtons.length > 0 && (
            <div className="flex items-center space-x-2">
              {leftButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={button.onClick}
                  className={`border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 ${
                    button.active ? 'bg-slate-700 text-white border-slate-500' : ''
                  }`}
                >
                  {button.icon}
                  <span className="ml-2 text-body-14">{button.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2">
          {rightButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.active ? "default" : "outline"}
              size="sm"
              onClick={button.onClick}
              className={button.active 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              }
            >
              {button.icon}
              <span className="ml-1 text-sm">{button.label}</span>
            </Button>
          ))}
          
          {/* Always show default buttons when no custom buttons are provided */}
          {leftButtons.length === 0 && rightButtons.length === 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                onClick={handleExportOutboundConfig}
              >
                <Download className="w-4 h-4 mr-1" />
                Export JSON
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <User className="w-4 h-4 mr-1" />
                Admin User
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}