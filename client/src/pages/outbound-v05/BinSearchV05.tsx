import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download, RefreshCw, Trash2, Edit, AlertCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import MainLayout from '@/components/MainLayout';
import IdentifierFieldset from './components/IdentifierFieldset';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { BinSearchFormData, BinSearchConfig } from '@/types/outbound-v05';
import { useV05FormOptions } from '@/hooks/useV05FormOptions';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { FieldStatusIndicator, FieldStatusLegend } from '@/components/FieldStatusIndicator';

// Multi-select component for state preferences
function MultiSelectStatePreference({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const formOptions = useV05FormOptions();
  const [newState, setNewState] = useState('');

  const addState = () => {
    if (newState && !value.includes(newState)) {
      onChange([...value, newState]);
      setNewState('');
    }
  };

  const removeState = (state: string) => {
    onChange(value.filter(s => s !== state));
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Select value={newState} onValueChange={setNewState}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Add state preference" />
          </SelectTrigger>
          <SelectContent className="z-[9999] relative">
            {formOptions.statePreferences.filter(option => !value.includes(option)).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={addState} disabled={!newState} variant="outline" size="sm">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((state, index) => (
          <Badge key={state} variant="secondary" className="flex items-center space-x-1">
            <span>{index + 1}. {state}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeState(state)}
              className="w-4 h-4 p-0 ml-1 hover:bg-red-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Multi-select component for area types and areas
function MultiSelectStringArray({ 
  value, 
  onChange, 
  placeholder,
  options
}: { 
  value: string[], 
  onChange: (value: string[]) => void,
  placeholder: string,
  options?: string[]
}) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem && !value.includes(newItem)) {
      onChange([...value, newItem]);
      setNewItem('');
    }
  };

  const removeItem = (item: string) => {
    onChange(value.filter(i => i !== item));
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        {options ? (
          <Select value={newItem} onValueChange={setNewItem}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="z-[9999] relative">
              {options.filter(option => !value.includes(option)).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1"
          />
        )}
        <Button type="button" onClick={addItem} disabled={!newItem} variant="outline" size="sm">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((item) => (
          <Badge key={item} variant="outline" className="flex items-center space-x-1">
            <span>{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item)}
              className="w-4 h-4 p-0 ml-1 hover:bg-red-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

const binSearchSchema = z.object({
  storageIdentifiers: z.object({
    category: z.string().optional(),
    skuClassType: z.string().optional(),
    skuClass: z.string().optional(),
    uom: z.string().optional(),
    bucket: z.string().optional(),
    specialStorageIndicator: z.string().optional(),
    preferredHUKind: z.string().optional(),
  }),
  lineIdentifiers: z.object({
    channel: z.string().optional(),
    vendor: z.string().optional(),
    asnType: z.string().optional(),
    customer: z.string().optional(),
  }),
  taskType: z.string().min(1, 'Task type is required'),
  taskSubKind: z.string(),
  taskAttrs: z.record(z.any()).default({}),
  mode: z.string().min(1, 'Mode is required'),
  priority: z.number().min(0, 'Priority must be 0 or greater'),
  skipZoneFace: z.string(),
  orderByQuantUpdatedAt: z.boolean(),
  searchScope: z.string().min(1, 'Search scope is required'),
  preferFixed: z.boolean(),
  preferNonFixed: z.boolean(),
  statePreferenceSeq: z.array(z.string()),
  batchPreferenceMode: z.string(),
  areaTypes: z.array(z.string()),
  areas: z.array(z.string()),
  orderByPickingPosition: z.boolean(),
  useInventorySnapshotForPickSlotting: z.boolean(),
  optimizationMode: z.string().min(1, 'Optimization mode is required'),
  disallowedBinTypes: z.array(z.string()),
  sortingMode: z.string(),
});

export default function BinSearchV05() {
  const { state } = useWizard();
  const { toast } = useToast();
  const formOptions = useV05FormOptions();
  const [binSearchConfigs, setBinSearchConfigs] = useState<BinSearchConfig[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BinSearchConfig | null>(null);
  const fetchedConfigs = useFetchedConfigurations();

  const form = useForm<BinSearchFormData>({
    resolver: zodResolver(binSearchSchema),
    defaultValues: {
      storageIdentifiers: {},
      lineIdentifiers: {},
      taskType: 'OUTBOUND_PICK',
      taskSubKind: '',
      taskAttrs: {},
      mode: 'PICK',
      priority: 1,
      skipZoneFace: '',
      orderByQuantUpdatedAt: false,
      searchScope: 'WH',
      preferFixed: false,
      preferNonFixed: false,
      statePreferenceSeq: ['AVAILABLE'],
      batchPreferenceMode: 'FIFO',
      areaTypes: [],
      areas: [],
      orderByPickingPosition: true,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: 'TOUCH',
      disallowedBinTypes: [],
      sortingMode: 'DISTANCE',
    }
  });

  // Load configurations from localStorage on mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('outboundV05Draft.binSearch');
    if (savedConfigs) {
      try {
        setBinSearchConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Error loading saved bin search configs:', error);
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('outboundV05Draft.binSearch', JSON.stringify(binSearchConfigs));
    }, 3000);

    return () => clearTimeout(timer);
  }, [binSearchConfigs]);

  // Auto-populate from fetched data
  useEffect(() => {
    if (fetchedConfigs.data.binSearch.length > 0 && binSearchConfigs.length === 0) {
      setBinSearchConfigs(fetchedConfigs.data.binSearch);
      toast({
        title: 'Bin Search Auto-Loaded',
        description: `Automatically loaded ${fetchedConfigs.data.binSearch.length} bin search configurations from fetched data.`,
      });
    }
  }, [fetchedConfigs.data.binSearch]);

  const loadFromFetchedConfigurations = async () => {
    if (!state.warehouseCode) {
      toast({
        title: 'No Warehouse Code',
        description: 'Please set a warehouse code in the top navigation first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingFetched(true);
    try {
      const fetchedConfig = await configurationApi.getStoredConfigurations(state.warehouseCode);
      
      // Note: Bin search might not exist in fetched data as it's a new configuration
      if (!fetchedConfig?.configurations?.binSearch) {
        toast({
          title: 'No Bin Search Data',
          description: 'No bin search configurations found in fetched data. This is a new configuration type.',
          variant: 'destructive',
        });
        return;
      }

      const binSearchData = fetchedConfig.configurations.binSearch;
      const convertedConfigs: BinSearchConfig[] = binSearchData.map((item: any) => ({
        id: item.id,
        whId: item.whId,
        storageIdentifiers: item.storageIdentifiers || {},
        lineIdentifiers: item.lineIdentifiers || {},
        taskType: item.taskType || 'OUTBOUND_PICK',
        taskSubKind: item.taskSubKind || '',
        taskAttrs: item.taskAttrs || {},
        mode: item.mode || 'PICK',
        priority: item.priority || 1,
        skipZoneFace: item.skipZoneFace || '',
        orderByQuantUpdatedAt: item.orderByQuantUpdatedAt || false,
        searchScope: item.searchScope || 'WH',
        preferFixed: item.preferFixed || false,
        preferNonFixed: item.preferNonFixed || false,
        statePreferenceSeq: item.statePreferenceSeq || ['AVAILABLE'],
        batchPreferenceMode: item.batchPreferenceMode || 'FIFO',
        areaTypes: item.areaTypes || [],
        areas: item.areas || [],
        orderByPickingPosition: item.orderByPickingPosition !== undefined ? item.orderByPickingPosition : true,
        useInventorySnapshotForPickSlotting: item.useInventorySnapshotForPickSlotting || false,
        optimizationMode: item.optimizationMode || 'TOUCH',
        disallowedBinTypes: item.disallowedBinTypes || [],
        sortingMode: item.sortingMode || 'DISTANCE',
      }));

      setBinSearchConfigs(convertedConfigs);
      toast({
        title: 'Configurations Loaded',
        description: `Successfully loaded ${convertedConfigs.length} bin search configurations.`,
      });

    } catch (error: any) {
      console.error('Error loading from fetched configurations:', error);
      toast({
        title: 'Load Failed',
        description: error.message || 'Failed to load from fetched configurations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFetched(false);
    }
  };

  const onSubmit = (data: BinSearchFormData) => {
    const newConfig: BinSearchConfig = {
      id: editingConfig?.id || crypto.randomUUID(),
      whId: state.warehouseCode ? parseInt(state.warehouseCode) : undefined,
      ...data,
      mode: data.mode as 'PICK' | 'PUTAWAY' | 'REPLENISHMENT',
      searchScope: data.searchScope as 'WH' | 'AREA' | 'ZONE',
      optimizationMode: data.optimizationMode as 'TOUCH' | 'DISTANCE',
    };

    if (editingConfig) {
      setBinSearchConfigs(prev => prev.map(config => 
        config.id === editingConfig.id ? newConfig : config
      ));
      toast({ title: 'Success', description: 'Bin search configuration updated successfully' });
    } else {
      setBinSearchConfigs(prev => [...prev, newConfig]);
      toast({ title: 'Success', description: 'Bin search configuration created successfully' });
    }

    form.reset();
    setIsFormVisible(false);
    setEditingConfig(null);
  };

  const handleEdit = (config: BinSearchConfig) => {
    setEditingConfig(config);
    form.reset(config);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    setBinSearchConfigs(prev => prev.filter(config => config.id !== id));
    toast({ title: 'Success', description: 'Bin search configuration deleted successfully' });
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleSave = () => {
    localStorage.setItem('outboundV05.binSearch', JSON.stringify(binSearchConfigs));
    console.log('Bin Search Configurations Saved:', JSON.stringify(binSearchConfigs, null, 2));
    toast({ title: 'Saved', description: 'Bin search configurations saved successfully' });
  };

  const getDisplayText = (config: BinSearchConfig) => {
    const identifierCount = [
      ...Object.values(config.storageIdentifiers).filter(Boolean),
      ...Object.values(config.lineIdentifiers).filter(Boolean)
    ].length;

    const searchConfig = `${config.optimizationMode} | ${config.searchScope} | ${config.mode}`;
    
    return {
      identifierText: identifierCount > 0 ? `${identifierCount} filters` : 'No filters',
      searchConfigText: searchConfig,
      areaInfo: config.areas.length > 0 ? `${config.areas.length} areas` : 'All areas',
    };
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Bin Search Configuration</h1>
            {state.warehouseCode && (
              <Badge variant="outline">Warehouse: {state.warehouseCode}</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {state.warehouseCode && (
              <Button 
                onClick={loadFromFetchedConfigurations}
                disabled={isLoadingFetched}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {isLoadingFetched ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Load from Fetched
              </Button>
            )}
            <Button onClick={handleSave} variant="outline">
              Save Configurations
            </Button>
            <Button 
              onClick={() => setIsFormVisible(true)}
              disabled={isFormVisible}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </div>

        {/* Information Alert with Field Status Legend */}
        <Alert className="border-gray-200 bg-gray-50">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <div className="space-y-2">
              <div>
                <strong>Bin Search Configuration</strong> defines how the system searches for optimal bins during pick, putaway, and replenishment operations. 
                Configure search scope, optimization modes, and area preferences for efficient bin selection.
              </div>
              {(fetchedConfigs.data.binSearch.length > 0 || fetchedConfigs.fetchedAt) && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <FieldStatusLegend />
                  {fetchedConfigs.fetchedAt && (
                    <span className="text-xs text-gray-600">
                      Data fetched: {new Date(fetchedConfigs.fetchedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Create/Edit Form */}
        {isFormVisible && (
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Bin Search Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Identifiers */}
                  <IdentifierFieldset 
                    control={form.control}
                    showLocationIdentifiers={false}
                    title="Identifiers"
                    configType="binSearch"
                    configIndex={0}
                  />

                  <Separator />

                  {/* Task Configuration */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Task Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="taskType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Type *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task type" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taskSubKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Sub Kind</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task sub kind" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Mode *</span>
                              <FieldStatusIndicator 
                                fieldPath="binSearch.0.mode"
                                className="ml-1"
                                currentValue={form.watch('mode')}
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                <SelectItem value="PICK">PICK</SelectItem>
                                <SelectItem value="PUTAWAY">PUTAWAY</SelectItem>
                                <SelectItem value="REPLENISHMENT">REPLENISHMENT</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Priority</span>
                              <FieldStatusIndicator 
                                fieldPath="binSearch.0.priority"
                                className="ml-1"
                                currentValue={form.watch('priority')}
                              />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Search Configuration */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Search Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="searchScope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Search Scope *</span>
                              <FieldStatusIndicator 
                                fieldPath="binSearch.0.searchScope"
                                className="ml-1"
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {formOptions.searchScopes.map((scope) => (
                                  <SelectItem key={scope} value={scope}>
                                    {scope}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="optimizationMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Optimization Mode *</span>
                              <FieldStatusIndicator 
                                fieldPath="binSearch.0.optimizationMode"
                                className="ml-1"
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select optimization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {formOptions.optimizationModes.map((mode) => (
                                  <SelectItem key={mode} value={mode}>
                                    {mode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sortingMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Sorting Mode</span>
                              <FieldStatusIndicator 
                                fieldPath="binSearch.0.sortingMode"
                                className="ml-1"
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sorting" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                <SelectItem value="DISTANCE">DISTANCE</SelectItem>
                                <SelectItem value="VOLUME">VOLUME</SelectItem>
                                <SelectItem value="WEIGHT">WEIGHT</SelectItem>
                                <SelectItem value="QUANTITY">QUANTITY</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="batchPreferenceMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select batch preference" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                <SelectItem value="FIFO">FIFO</SelectItem>
                                <SelectItem value="LIFO">LIFO</SelectItem>
                                <SelectItem value="FEFO">FEFO</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skipZoneFace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skip Zone Face</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter zone face to skip" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Boolean switches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {[
                        { name: 'preferFixed', label: 'Prefer Fixed Locations' },
                        { name: 'preferNonFixed', label: 'Prefer Non-Fixed Locations' },
                        { name: 'orderByQuantUpdatedAt', label: 'Order by Quantity Updated At' },
                        { name: 'orderByPickingPosition', label: 'Order by Picking Position' },
                        { name: 'useInventorySnapshotForPickSlotting', label: 'Use Inventory Snapshot for Pick Slotting' },
                      ].map(({ name, label }) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name as any}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">{label}</FormLabel>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    {/* State Preference Sequence */}
                    <FormField
                      control={form.control}
                      name="statePreferenceSeq"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State Preference Sequence</FormLabel>
                          <FormControl>
                            <MultiSelectStatePreference
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Area Types */}
                    <FormField
                      control={form.control}
                      name="areaTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Types</FormLabel>
                          <FormControl>
                            <MultiSelectStringArray
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Add area type"
                              options={formOptions.areaTypes}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Areas */}
                    <FormField
                      control={form.control}
                      name="areas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Areas</FormLabel>
                          <FormControl>
                            <MultiSelectStringArray
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Add area name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Disallowed Bin Types */}
                    <FormField
                      control={form.control}
                      name="disallowedBinTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disallowed Bin Types</FormLabel>
                          <FormControl>
                            <MultiSelectStringArray
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Add disallowed bin type"
                              options={formOptions.binTypes}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                      {editingConfig ? 'Update Configuration' : 'Create Configuration'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Configurations List */}
        {binSearchConfigs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Bin Search Configurations ({binSearchConfigs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Search Config</TableHead>
                    <TableHead>Areas</TableHead>
                    <TableHead>State Preferences</TableHead>
                    <TableHead>Identifiers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {binSearchConfigs
                    .sort((a, b) => a.priority - b.priority)
                    .map((config) => {
                      const { identifierText, searchConfigText, areaInfo } = getDisplayText(config);
                      return (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.priority}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{config.taskType}</div>
                              {config.taskSubKind && (
                                <div className="text-sm text-gray-600">{config.taskSubKind}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{searchConfigText}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">{areaInfo}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {config.statePreferenceSeq.slice(0, 3).map((state, index) => (
                                <Badge key={state} variant="outline" className="text-xs">
                                  {index + 1}. {state}
                                </Badge>
                              ))}
                              {config.statePreferenceSeq.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{config.statePreferenceSeq.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{identifierText}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(config)}
                                disabled={isFormVisible}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(config.id!)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 text-gray-400 mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bin Search Configurations</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first bin search configuration or load from fetched warehouse data.
              </p>
              <div className="flex space-x-2">
                {state.warehouseCode && (
                  <Button 
                    onClick={loadFromFetchedConfigurations}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Load from Fetched
                  </Button>
                )}
                <Button 
                  onClick={() => setIsFormVisible(true)}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}