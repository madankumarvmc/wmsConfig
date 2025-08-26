import { useState, useEffect, useRef } from 'react';
import { FileCode, Copy, Download, Search, X, Edit3, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';

interface JsonPayloadSidebarProps {
  className?: string;
}

export default function JsonPayloadSidebar({ className }: JsonPayloadSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [changeCount, setChangeCount] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const fetchedConfigs = useFetchedConfigurations();
  const { configuration, saveJsonChanges } = useConfiguration();
  const { toast } = useToast();

  // Get the clean payload from central store (current state with top-level metadata)
  const fullPayload = {
    warehouseCode: configuration.warehouseCode,
    fetchedAt: configuration.fetchedAt,
    data: {
      lineSplit: configuration.lineSplit,
      taskSequences: configuration.taskSequences,
      taskStrategy: configuration.taskStrategy,
      binSearch: configuration.binSearch
    }
  };

  const hasData = configuration.warehouseCode || (
    configuration.lineSplit.length > 0 ||
    configuration.taskSequences.length > 0 ||
    configuration.taskStrategy.length > 0 ||
    configuration.binSearch.length > 0
  );
  const formattedJson = hasData ? JSON.stringify(fullPayload, null, 2) : '';

  // Initialize edited JSON when data changes
  useEffect(() => {
    if (hasData && !editedJson) {
      setEditedJson(formattedJson);
    }
  }, [hasData, formattedJson, editedJson]);

  // Resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      setSidebarWidth(Math.min(Math.max(newWidth, 30), 90)); // Limit between 30% and 90%
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Change detection system
  const detectChanges = () => {
    if (!hasData) return {};

    const currentChanges: Record<string, any> = {};
    
    // For now, disable change detection since we removed the original data source
    // TODO: Implement baseline comparison if needed
    const currentData = {
      lineSplit: configuration.lineSplit,
      taskSequences: configuration.taskSequences,
      taskStrategy: configuration.taskStrategy,
      binSearch: configuration.binSearch
    };

    // No original data to compare against in the new architecture
    const originalData = {
      lineSplit: [],
      taskSequences: [],
      taskStrategy: [],
      binSearch: []
    };

    // Check each section for changes
    Object.keys(currentData).forEach(section => {
      const current = currentData[section as keyof typeof currentData];
      const original = originalData[section as keyof typeof originalData];

      if (JSON.stringify(current) !== JSON.stringify(original)) {
        currentChanges[section] = {
          type: 'modified',
          original: original.length,
          current: current.length,
          hasChanges: true
        };
      }
    });

    return currentChanges;
  };

  // Monitor localStorage changes
  useEffect(() => {
    const detectedChanges = detectChanges();
    setChanges(detectedChanges);
    setChangeCount(Object.keys(detectedChanges).length);

    // Set up interval to periodically check for changes
    const interval = setInterval(() => {
      const newChanges = detectChanges();
      if (JSON.stringify(newChanges) !== JSON.stringify(changes)) {
        setChanges(newChanges);
        setChangeCount(Object.keys(newChanges).length);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasData, fetchedConfigs.data]);

  const handleSaveJsonChanges = async () => {
    if (!isEditing) {
      toast({
        title: 'No Changes to Save',
        description: 'Switch to edit mode to make changes first.',
        variant: 'default',
      });
      return;
    }

    const success = saveJsonChanges(editedJson);
    if (success) {
      toast({
        title: 'JSON Changes Saved!',
        description: 'JSON changes have been saved to central store and synced to forms.',
      });
      // Switch back to view mode after successful save
      setIsEditing(false);
    } else {
      toast({
        title: 'Save Failed',
        description: 'Invalid JSON format. Please check your syntax.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = isEditing ? editedJson : formattedJson;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied!',
        description: 'JSON copied to clipboard successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedJson : formattedJson;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-${configuration.warehouseCode}-config${isEditing ? '-edited' : ''}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded!',
      description: 'Configuration downloaded successfully',
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedJson(formattedJson); // Reset to original when starting edit
    }
  };

  // Enhanced highlighting with search and changes
  const highlightSearchAndChanges = (text: string, search: string) => {
    let highlighted = text;

    // Apply change highlighting first
    if (changeCount > 0) {
      Object.keys(changes).forEach(section => {
        // Highlight section headers that have changes
        const sectionRegex = new RegExp(`("${section}":\\s*\\[)`, 'g');
        highlighted = highlighted.replace(sectionRegex, '<span class="bg-orange-100 border-l-2 border-orange-400 pl-1">$1</span>');
      });
    }

    // Apply search highlighting on top
    if (search && search.trim()) {
      const searchRegex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlighted = highlighted.replace(searchRegex, '<mark class="bg-yellow-300 px-1 rounded font-semibold">$1</mark>');
    }

    return highlighted;
  };

  // Don't render if no data
  if (!hasData) {
    return null;
  }

  const currentJson = isEditing ? editedJson : formattedJson;
  const displayJson = highlightSearchAndChanges(currentJson, searchTerm);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 border-0 ${className}`}
          title="View JSON Configuration"
        >
          <FileCode className="h-5 w-5 text-white" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="p-0 gap-0 h-screen flex flex-col"
        style={{ width: `${sidebarWidth}vw`, maxWidth: 'none' }}
        ref={sidebarRef}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-500 cursor-ew-resize flex items-center justify-center group transition-colors z-10"
          onMouseDown={() => setIsResizing(true)}
          title="Drag to resize"
        >
          <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        {/* Header Section */}
        <SheetHeader className="px-6 py-4 border-b bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              Fetched Configuration JSON
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                WH: {configuration.warehouseCode}
              </Badge>
              {changeCount > 0 && (
                <Badge variant="default" className="bg-orange-500 text-white">
                  {changeCount} Change{changeCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          {configuration.fetchedAt && (
            <p className="text-sm text-gray-600">
              Fetched: {new Date(configuration.fetchedAt).toLocaleString()}
            </p>
          )}
          {configuration.lastSaved && (
            <p className="text-sm text-gray-500">
              Last saved: {new Date(configuration.lastSaved).toLocaleString()}
            </p>
          )}
        </SheetHeader>

        {/* Change Summary */}
        {changeCount > 0 && (
          <div className="px-6 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-orange-800">
                <strong>{changeCount}</strong> section{changeCount > 1 ? 's' : ''} modified via forms:
                <span className="ml-2">
                  {Object.entries(changes).map(([section, change], index) => (
                    <span key={section} className="inline-flex items-center">
                      {index > 0 && ', '}
                      <span className="font-medium">{section}</span>
                      <span className="ml-1 text-xs">
                        ({change.original}→{change.current})
                      </span>
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="px-6 py-3 border-b bg-white shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search in JSON..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={handleEditToggle}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                {isEditing ? 'View' : 'Edit'}
              </Button>
              {isEditing ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSaveJsonChanges}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4" />
                  Save JSON Changes
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* JSON Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {isEditing ? (
            /* Edit Mode - Full height textarea */
            <div className="flex-1 p-4 min-h-0">
              <Textarea
                value={editedJson}
                onChange={(e) => setEditedJson(e.target.value)}
                className="w-full h-full font-mono text-sm leading-6 resize-none border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Edit JSON here..."
              />
            </div>
          ) : (
            /* View Mode - Scrollable content */
            <div className="flex-1 bg-gray-50 flex min-h-0">
              {/* Line Numbers */}
              <div className="bg-gray-100 border-r text-right min-w-[60px] flex-shrink-0 overflow-y-hidden">
                <div className="px-3 py-4">
                  {currentJson.split('\n').map((_, index) => (
                    <div key={index} className="text-xs text-gray-500 leading-6 font-mono h-6">
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* JSON Content - Scrollable */}
              <div className="flex-1 overflow-auto bg-white">
                <pre 
                  className="p-4 text-sm font-mono leading-6 whitespace-pre-wrap text-gray-800 block"
                  style={{ minHeight: '100%' }}
                  dangerouslySetInnerHTML={{ 
                    __html: displayJson 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 shrink-0">
          {isEditing ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-800">
                ✏️ <strong>Editing Mode:</strong> Make changes to the JSON. Click "View" to see formatted version.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  👀 <strong>View Mode:</strong> Original fetched data
                  {changeCount > 0 && (
                    <span className="ml-2 text-orange-700">
                      • <span className="bg-orange-200 px-2 py-1 rounded text-xs font-medium">
                        Sections with changes highlighted
                      </span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}