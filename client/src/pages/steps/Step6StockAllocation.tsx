import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, CheckCircle, Edit, Package, Settings, Database, Plus, Trash2, Archive } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  categories,
  skuClassTypes,
  skuClasses,
  uoms,
  buckets,
  taskTypes,
  areaTypes,
  searchScopes,
  statePreferenceOptions,
  batchPreferenceModes,
  optimizationModes
} from '@/lib/mockData';

// Inventory Group Schema
const inventoryGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  storageIdentifiers: z.object({
    category: z.string().optional(),
    skuClassType: z.string().optional(),
    skuClass: z.string().optional(),
    uom: z.string().optional(),
    bucket: z.string().optional(),
  }),
  taskType: z.string().min(1, "Task type is required"),
  taskSubKind: z.string(),
  taskAttrs: z.object({
    destUOM: z.string().min(1, "Destination UOM is required"),
  }),
  areaTypes: z.array(z.string()),
  areas: z.array(z.string()),
});

// Stock Allocation Strategy Schema
const stockAllocationSchema = z.object({
  mode: z.enum(["PICK", "PUT"]),
  priority: z.number().min(1).max(1000),
  skipZoneFace: z.boolean().nullable(),
  orderByQuantUpdatedAt: z.boolean(),
  searchScope: z.string().min(1, "Search scope is required"),
  preferFixed: z.boolean(),
  preferNonFixed: z.boolean(),
  statePreferenceSeq: z.array(z.string()),
  batchPreferenceMode: z.string(),
  orderByPickingPosition: z.boolean(),
  useInventorySnapshotForPickSlotting: z.boolean(),
  optimizationMode: z.string().min(1, "Optimization mode is required"),
});

type InventoryGroup = z.infer<typeof inventoryGroupSchema>;
type StockAllocation = z.infer<typeof stockAllocationSchema>;

export default function Step6StockAllocation() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedStrategyMode, setSelectedStrategyMode] = useState<"PICK" | "PUT" | null>(null);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const groupForm = useForm<InventoryGroup>({
    resolver: zodResolver(inventoryGroupSchema),
    defaultValues: {
      name: '',
      storageIdentifiers: {},
      taskType: 'OUTBOUND_REPLEN',
      taskSubKind: '',
      taskAttrs: { destUOM: 'L0' },
      areaTypes: ['INVENTORY'],
      areas: [],
    }
  });

  const strategyForm = useForm<StockAllocation>({
    resolver: zodResolver(stockAllocationSchema),
    defaultValues: {
      mode: 'PICK',
      priority: 100,
      skipZoneFace: null,
      orderByQuantUpdatedAt: false,
      searchScope: 'AREA',
      preferFixed: true,
      preferNonFixed: false,
      statePreferenceSeq: ['PURE', 'IMPURE', 'EMPTY', 'SKU_EMPTY'],
      batchPreferenceMode: 'NONE',
      orderByPickingPosition: false,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: 'TOUCH',
    }
  });

  const { data: inventoryGroups = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const { data: allStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/stock-allocation-strategies'],
  });

  const selectedGroupStrategies = selectedGroupId 
    ? allStrategies.filter(s => s.inventoryGroupId === selectedGroupId)
    : [];

  const createGroupMutation = useMutation({
    mutationFn: async (data: InventoryGroup) => {
      const response = await apiRequest('POST', '/api/inventory-groups', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-allocation-strategies'] });
      toast({ title: "Inventory Group created successfully" });
      setIsCreateGroupOpen(false);
      groupForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to create Inventory Group", variant: "destructive" });
    }
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: StockAllocation }) => {
      const response = await apiRequest('PUT', `/api/stock-allocation-strategies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock-allocation-strategies'] });
      toast({ title: "Stock Allocation Strategy updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update Strategy", variant: "destructive" });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/inventory-groups/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-allocation-strategies'] });
      toast({ title: "Inventory Group deleted successfully" });
      setSelectedGroupId(null);
      setSelectedStrategyMode(null);
    },
    onError: () => {
      toast({ title: "Failed to delete Inventory Group", variant: "destructive" });
    }
  });

  const onCreateGroup = (data: InventoryGroup) => {
    createGroupMutation.mutate(data);
  };

  const onUpdateStrategy = (data: StockAllocation) => {
    if (selectedStrategyMode && selectedGroupId) {
      const strategy = selectedGroupStrategies.find(s => s.mode === selectedStrategyMode);
      if (strategy) {
        updateStrategyMutation.mutate({ id: strategy.id, data });
      }
    }
  };

  const handleSelectGroup = (group: any) => {
    setSelectedGroupId(group.id);
    setSelectedStrategyMode(null);
  };

  const handleSelectStrategy = (mode: "PICK" | "PUT") => {
    setSelectedStrategyMode(mode);
    const strategy = selectedGroupStrategies.find(s => s.mode === mode);
    if (strategy) {
      strategyForm.reset(strategy);
    }
  };

  const addStatePreference = (state: string) => {
    const current = strategyForm.getValues('statePreferenceSeq');
    if (!current.includes(state)) {
      strategyForm.setValue('statePreferenceSeq', [...current, state]);
    }
  };

  const removeStatePreference = (state: string) => {
    const current = strategyForm.getValues('statePreferenceSeq');
    strategyForm.setValue('statePreferenceSeq', current.filter(s => s !== state));
  };

  const addAreaType = (areaType: string) => {
    const current = groupForm.getValues('areaTypes');
    if (!current.includes(areaType)) {
      groupForm.setValue('areaTypes', [...current, areaType]);
    }
  };

  const removeAreaType = (areaType: string) => {
    const current = groupForm.getValues('areaTypes');
    groupForm.setValue('areaTypes', current.filter(at => at !== areaType));
  };

  const getGroupStatus = (groupId: number) => {
    const strategies = allStrategies.filter(s => s.inventoryGroupId === groupId);
    return strategies.length === 2 ? 'configured' : 'incomplete';
  };

  const configuredGroupsCount = inventoryGroups.filter(group => 
    getGroupStatus(group.id) === 'configured'
  ).length;

  const handleNext = () => {
    if (configuredGroupsCount === 0) {
      toast({ 
        title: "Configuration Required", 
        description: "Please create and configure at least one inventory group with PICK and PUT strategies before proceeding.",
        variant: "destructive" 
      });
      return;
    }
    dispatch({ type: 'COMPLETE_STEP', payload: 6 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 7 });
    setLocation('/step7');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    setLocation('/step5');
  };

  const watchedStatePreferences = strategyForm.watch('statePreferenceSeq');
  const watchedAreaTypes = groupForm.watch('areaTypes');

  return (
    <WizardLayout
      title="Stock Allocation Strategy"
      description="Define inventory groups and configure PICK and PUT stock allocation strategies for each group."
      currentStep={6}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Review & Confirm"
      previousLabel="Previous: Work Orders"
    >
      {/* Step Description */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Step 5: Stock Allocation Strategy</strong> - Create inventory groups and define PICK and PUT allocation strategies. Each group must have both PICK and PUT strategies configured.
        </AlertDescription>
      </Alert>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Configuration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">
              {configuredGroupsCount}/{inventoryGroups.length}
            </div>
            <div className="text-sm text-gray-600">
              Inventory groups fully configured (PICK + PUT)
            </div>
            {configuredGroupsCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ready to proceed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Inventory Groups Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Inventory Groups</CardTitle>
              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Inventory Group</DialogTitle>
                  </DialogHeader>
                  <Form {...groupForm}>
                    <form onSubmit={groupForm.handleSubmit(onCreateGroup)} className="space-y-4">
                      <FormField
                        control={groupForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter group name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={groupForm.control}
                          name="taskType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {taskTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={groupForm.control}
                          name="taskAttrs.destUOM"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Destination UOM</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {uoms.map(uom => (
                                    <SelectItem key={uom.value} value={uom.value}>{uom.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Storage Identifiers */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Storage Identifiers</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={groupForm.control}
                            name="storageIdentifiers.category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={groupForm.control}
                            name="storageIdentifiers.skuClassType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">SKU Class Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {skuClassTypes.map(type => (
                                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Area Types */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Area Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {watchedAreaTypes?.map((type) => (
                            <Badge key={type} variant="secondary" className="flex items-center">
                              {type}
                              <button
                                type="button"
                                onClick={() => removeAreaType(type)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={addAreaType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add area type" />
                          </SelectTrigger>
                          <SelectContent>
                            {areaTypes
                              .filter(option => !watchedAreaTypes?.includes(option.value))
                              .map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateGroupOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createGroupMutation.isPending}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventoryGroups.map((group) => {
                const status = getGroupStatus(group.id);
                const isSelected = selectedGroupId === group.id;
                
                return (
                  <div
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{group.name}</div>
                        <div className="text-xs text-gray-500">{group.taskType}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {status === 'configured' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Edit className="w-4 h-4 text-orange-500" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroupMutation.mutate(group.id);
                          }}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {inventoryGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No inventory groups yet.</p>
                  <p className="text-sm">Click "Add" to create your first group.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PICK/PUT Strategies Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Allocation Strategies</CardTitle>
            <p className="text-sm text-gray-600">
              {selectedGroupId ? 'Select PICK or PUT strategy' : 'Select a group first'}
            </p>
          </CardHeader>
          <CardContent>
            {selectedGroupId ? (
              <div className="space-y-2">
                {['PICK', 'PUT'].map((mode) => {
                  const strategy = selectedGroupStrategies.find(s => s.mode === mode);
                  const isSelected = selectedStrategyMode === mode;
                  
                  return (
                    <div
                      key={mode}
                      onClick={() => handleSelectStrategy(mode as "PICK" | "PUT")}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{mode} Strategy</div>
                          <div className="text-sm text-gray-500">
                            Priority: {strategy?.priority || 100}
                          </div>
                          <div className="text-sm text-gray-500">
                            Scope: {strategy?.searchScope || 'AREA'}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {strategy ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Edit className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select an Inventory Group</p>
                <p className="text-sm">Choose a group from the left panel to view its strategies.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategy Configuration Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Strategy Configuration
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedStrategyMode 
                ? `Configuring ${selectedStrategyMode} strategy`
                : 'Select a PICK or PUT strategy to configure'
              }
            </p>
          </CardHeader>
          <CardContent>
            {selectedStrategyMode && selectedGroupId ? (
              <Form {...strategyForm}>
                <form onSubmit={strategyForm.handleSubmit(onUpdateStrategy)} className="space-y-6">
                  {/* Basic Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Basic Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={strategyForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="1000"
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 100)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="searchScope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Search Scope</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {searchScopes.map(scope => (
                                  <SelectItem key={scope.value} value={scope.value}>{scope.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="batchPreferenceMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batch Preference</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {batchPreferenceModes.map(mode => (
                                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="optimizationMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Optimization Mode</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {optimizationModes.map(mode => (
                                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={strategyForm.control}
                        name="preferFixed"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Prefer Fixed Locations</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="preferNonFixed"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Prefer Non-Fixed Locations</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="orderByQuantUpdatedAt"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Order by Quantity Updated At</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="orderByPickingPosition"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Order by Picking Position</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="useInventorySnapshotForPickSlotting"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Use Inventory Snapshot</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={strategyForm.control}
                        name="skipZoneFace"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={(checked) => field.onChange(checked ? true : null)}
                              />
                            </FormControl>
                            <FormLabel>Skip Zone Face</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* State Preference Sequence */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">State Preference Sequence</h3>
                    <div className="flex flex-wrap gap-2">
                      {watchedStatePreferences?.map((state, index) => (
                        <Badge key={state} variant="secondary" className="flex items-center">
                          {index + 1}. {state}
                          <button
                            type="button"
                            onClick={() => removeStatePreference(state)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addStatePreference}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add state preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {statePreferenceOptions
                          .filter(option => !watchedStatePreferences?.includes(option.value))
                          .map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={updateStrategyMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {updateStrategyMutation.isPending ? 'Saving...' : 'Save Strategy'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a Strategy</p>
                <p className="text-sm">Choose a PICK or PUT strategy from the middle panel to configure its settings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}