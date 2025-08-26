import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, Save, User, ChevronDown, Settings, Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import FetchConfigurationDialog from '@/components/dialogs/FetchConfigurationDialog';
import CopyConfigurationDialog from '@/components/dialogs/CopyConfigurationDialog';
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
  onMenuClick?: () => void;
}

export default function TopNavbar({ leftButtons = [], rightButtons = [], onMenuClick }: TopNavbarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { dispatch } = useWizard();
  const { fetchConfigurations, isLoading, data: fetchedData } = useFetchedConfigurations();
  const { configuration, loadFromFetchedData } = useConfiguration();
  
  // Dialog states
  const [fetchDialogOpen, setFetchDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const handleFetchConfiguration = async (warehouseCode: string) => {
    try {
      // Example API endpoints
      const apiEndpoints = {
        lineSplit: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/strategy/outbound/line-split/query?whId={warehouseCode}',
        taskSequences: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/strategy/outbound/task-sequence/query?whId={warehouseCode}',
        taskStrategy: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/task_strategy/query?whId={warehouseCode}',
        binSearch: 'http://cincout.sbx-sea-uat.api.staging.stackbox.internal/task-strategy/bin-search/query?whId={warehouseCode}',
      };

      console.log('\n🚀 STARTING CONFIGURATION FETCH');
      console.log('📍 Warehouse Code:', warehouseCode);
      
      // Fetch configurations with callback to populate central store
      await fetchConfigurations(warehouseCode, apiEndpoints, (whCode, data) => {
        loadFromFetchedData(whCode, data);
      });
      
      // Save warehouse code to wizard context for compatibility
      dispatch({ type: 'SET_WAREHOUSE_CODE', payload: warehouseCode });
      
      toast({
        title: 'Configurations Fetched & Loaded',
        description: `Successfully fetched and loaded configurations for warehouse ${warehouseCode}`,
      });
      
      // Close dialog on success
      setFetchDialogOpen(false);

    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: 'Fetch Failed',
        description: 'Failed to fetch configurations. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyConfiguration = async (targetWarehouseCode: string) => {
    try {
      // TODO: Implement copy configuration API call
      console.log('🔄 COPYING CONFIGURATION');
      console.log('📍 From Warehouse:', configuration.warehouseCode);
      console.log('📍 To Warehouse:', targetWarehouseCode);
      
      // Placeholder for copy logic
      toast({
        title: 'Copy Configuration',
        description: `Configuration copy from ${configuration.warehouseCode} to ${targetWarehouseCode} - Feature coming soon!`,
      });
      
      // Close dialog
      setCopyDialogOpen(false);

    } catch (error) {
      console.error('Error copying configurations:', error);
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy configurations. Please try again.',
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
    <>
    <nav id="top-navbar" className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 shadow-sm h-[72px] flex items-center flex-shrink-0" role="banner">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* Mobile hamburger menu */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <img 
              id="sbx-logo"
              src={sbxLogo} 
              alt="SBX Logo" 
              className="w-6 h-6 md:w-8 md:h-8 rounded flex-shrink-0"
            />
            <h1 className="text-lg md:text-xl font-medium text-white truncate md:whitespace-nowrap">
              <span className="hidden sm:inline">SBX Warehouse Configuration Portal</span>
              <span className="sm:hidden">SBX Config</span>
            </h1>
          </div>

          {/* Current Warehouse Display (if available) */}
          {configuration.warehouseCode && (
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-300">Warehouse:</span>
              <span className="text-sm font-semibold text-white bg-slate-700 px-2 py-1 rounded">
                {configuration.warehouseCode}
              </span>
            </div>
          )}
            
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="actions-dropdown-trigger"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 disabled:opacity-50 focus:ring-2 focus:ring-slate-400"
                  aria-label="Configuration actions"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  <span className="hidden lg:inline">{isLoading ? 'Fetching...' : 'Actions'}</span>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                id="actions-dropdown-content" 
                className="bg-slate-800 border-slate-600"
                align="end"
              >
                <DropdownMenuItem 
                  id="fetch-configurations-item"
                  onClick={() => setFetchDialogOpen(true)}
                  disabled={isLoading}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:bg-slate-700 focus:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fetch Configuration
                </DropdownMenuItem>
                <DropdownMenuItem 
                  id="copy-configurations-item"
                  onClick={() => setCopyDialogOpen(true)}
                  disabled={isLoading || !configuration.warehouseCode}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:bg-slate-700 focus:text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Copy Configuration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          
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
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Mobile warehouse code dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700"
                  aria-label="Warehouse settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="bg-slate-800 border-slate-600 w-64"
                align="end"
              >
                {configuration.warehouseCode && (
                  <div className="p-3 border-b border-slate-600">
                    <div className="text-sm font-medium text-slate-300 mb-1">
                      Current Warehouse:
                    </div>
                    <div className="text-sm font-semibold text-white bg-slate-700 px-2 py-1 rounded">
                      {configuration.warehouseCode}
                    </div>
                  </div>
                )}
                <DropdownMenuItem 
                  onClick={() => setFetchDialogOpen(true)}
                  disabled={isLoading}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Fetch Configuration
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setCopyDialogOpen(true)}
                  disabled={isLoading || !configuration.warehouseCode}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Copy Configuration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {rightButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.active ? "default" : "outline"}
              size="sm"
              onClick={button.onClick}
              className={`focus:ring-2 focus:ring-slate-400 ${button.active 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              }`}
            >
              {button.icon}
              <span className="ml-1 text-sm hidden sm:inline">{button.label}</span>
            </Button>
          ))}
          
          {/* Always show default buttons when no custom buttons are provided */}
          {leftButtons.length === 0 && rightButtons.length === 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 focus:ring-2 focus:ring-slate-400"
                aria-label="Save draft"
              >
                <Save className="w-4 h-4" />
                <span className="ml-1 hidden lg:inline">Save Draft</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 focus:ring-2 focus:ring-slate-400"
                onClick={handleExportOutboundConfig}
                aria-label="Export configuration as JSON"
              >
                <Download className="w-4 h-4" />
                <span className="ml-1 hidden lg:inline">Export JSON</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 focus:ring-2 focus:ring-slate-400"
                aria-label="User account menu"
              >
                <User className="w-4 h-4" />
                <span className="ml-1 hidden lg:inline">Admin User</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>

    {/* Dialogs */}
    <FetchConfigurationDialog
      open={fetchDialogOpen}
      onOpenChange={setFetchDialogOpen}
      onFetch={handleFetchConfiguration}
      isLoading={isLoading}
    />

    <CopyConfigurationDialog
      open={copyDialogOpen}
      onOpenChange={setCopyDialogOpen}
      onCopy={handleCopyConfiguration}
      sourceWarehouseCode={configuration.warehouseCode}
      isLoading={false}
    />
    </>
  );
}