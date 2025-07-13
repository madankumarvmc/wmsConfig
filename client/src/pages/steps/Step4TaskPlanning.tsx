import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit, Trash2, Info, CheckCircle, AlertTriangle, Target, Brain } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InventoryGroup, TaskPlanningConfiguration, InsertTaskPlanningConfiguration } from '../../../../shared/schema';

const taskPlanningSchema = z.object({
  inventoryGroupId: z.number().min(1, "Inventory group is required"),
  configurationName: z.string().min(1, "Configuration name is required"),
  description: z.string().optional(),
  taskKind: z.string().optional(),
  taskSubKind: z.string().optional(),
  strat: z.string().optional(),
  sortingStrategy: z.string().optional(),
  loadingStrategy: z.string().optional(),
  groupBy: z.array(z.string()).optional(),
  taskLabel: z.string().optional(),
  mode: z.string().optional(),
  priority: z.number().optional(),
  skipZoneFace: z.string().optional(),
  orderByQuantUpdatedAt: z.boolean().optional(),
  searchScope: z.string().optional(),
  statePreferenceOrder: z.array(z.string()).optional(),
  preferFixed: z.boolean().optional(),
  preferNonFixed: z.boolean().optional(),
  statePreferenceSeq: z.array(z.string()).optional(),
  batchPreferenceMode: z.string().optional(),
  areaTypes: z.array(z.string()).optional(),
  areas: z.array(z.string()).optional(),
  orderByPickingPosition: z.boolean().optional(),
  useInventorySnapshotForPickSlotting: z.boolean().optional(),
  optimizationMode: z.string().optional(),
});

type TaskPlanningForm = z.infer<typeof taskPlanningSchema>;

export default function Step4TaskPlanning() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<TaskPlanningConfiguration | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: inventoryGroups = [] } = useQuery<InventoryGroup[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const { data: configurations = [] } = useQuery<TaskPlanningConfiguration[]>({
    queryKey: ['/api/task-planning'],
  });

  const form = useForm<TaskPlanningForm>({
    resolver: zodResolver(taskPlanningSchema),
    defaultValues: {
      inventoryGroupId: 0,
      configurationName: '',
      description: '',
      taskKind: '',
      taskSubKind: '',
      strat: '',
      sortingStrategy: '',
      loadingStrategy: '',
      groupBy: [],
      taskLabel: '',
      mode: '',
      priority: 100,
      skipZoneFace: '',
      orderByQuantUpdatedAt: false,
      searchScope: '',
      statePreferenceOrder: [],
      preferFixed: false,
      preferNonFixed: false,
      statePreferenceSeq: [],
      batchPreferenceMode: '',
      areaTypes: [],
      areas: [],
      orderByPickingPosition: false,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: '',
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertTaskPlanningConfiguration) => {
      const response = await apiRequest('POST', '/api/task-planning', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning'] });
      toast({
        title: 'Success',
        description: 'Task planning configuration saved successfully.',
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save task planning configuration.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/task-planning/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning'] });
      toast({
        title: 'Success',
        description: 'Task planning configuration deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete task planning configuration.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TaskPlanningForm) => {
    const submitData = {
      ...data,
      groupBy: data.groupBy?.length ? data.groupBy : undefined,
      statePreferenceOrder: data.statePreferenceOrder?.length ? data.statePreferenceOrder : undefined,
      statePreferenceSeq: data.statePreferenceSeq?.length ? data.statePreferenceSeq : undefined,
      areaTypes: data.areaTypes?.length ? data.areaTypes : undefined,
      areas: data.areas?.length ? data.areas : undefined,
    };
    saveMutation.mutate(submitData);
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleEdit = (config: TaskPlanningConfiguration) => {
    setEditingConfig(config);
    setIsFormVisible(true);
    form.reset({
      inventoryGroupId: config.inventoryGroupId,
      configurationName: config.configurationName,
      description: config.description || '',
      taskKind: config.taskKind || '',
      taskSubKind: config.taskSubKind || '',
      strat: config.strat || '',
      sortingStrategy: config.sortingStrategy || '',
      loadingStrategy: config.loadingStrategy || '',
      groupBy: config.groupBy || [],
      taskLabel: config.taskLabel || '',
      mode: config.mode || '',
      priority: config.priority || 100,
      skipZoneFace: config.skipZoneFace || '',
      orderByQuantUpdatedAt: config.orderByQuantUpdatedAt || false,
      searchScope: config.searchScope || '',
      statePreferenceOrder: config.statePreferenceOrder || [],
      preferFixed: config.preferFixed || false,
      preferNonFixed: config.preferNonFixed || false,
      statePreferenceSeq: config.statePreferenceSeq || [],
      batchPreferenceMode: config.batchPreferenceMode || '',
      areaTypes: config.areaTypes || [],
      areas: config.areas || [],
      orderByPickingPosition: config.orderByPickingPosition || false,
      useInventorySnapshotForPickSlotting: config.useInventorySnapshotForPickSlotting || false,
      optimizationMode: config.optimizationMode || '',
    });
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 4 });
    setLocation('/step/5');
  };

  const getInventoryGroupName = (id: number) => {
    const group = inventoryGroups.find(g => g.id === id);
    return group?.name || `Group ${id}`;
  };

  return (
    <WizardLayout 
      currentStep={4} 
      title="Task Planning Configuration"
      description="Configure task planning strategies for inventory groups"
    >
      <div className="space-y-6">
        {/* Header and Add Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Task Planning Strategies</h2>
          </div>
          <Button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Configuration
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Task planning configurations define how tasks are organized and prioritized for each inventory group. 
            All fields are optional and can be configured based on your warehouse requirements.
          </AlertDescription>
        </Alert>

        {/* Configuration Form */}
        {isFormVisible && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {editingConfig ? 'Edit Task Planning Configuration' : 'New Task Planning Configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                      <TabsTrigger value="strategy">Strategy Config</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="inventoryGroupId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inventory Group</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select inventory group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {inventoryGroups.map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                      {group.name}
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
                          name="configurationName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Configuration Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter configuration name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Optional description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="taskKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Kind</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select task kind" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="OUTBOUND_PICK">OUTBOUND_PICK</SelectItem>
                                  <SelectItem value="OUTBOUND_REPLEN">OUTBOUND_REPLEN</SelectItem>
                                  <SelectItem value="INBOUND_PUT">INBOUND_PUT</SelectItem>
                                  <SelectItem value="CYCLE_COUNT">CYCLE_COUNT</SelectItem>
                                </SelectContent>
                              </Select>
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
                                <Input placeholder="Optional sub kind" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="100" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="strategy" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="strat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Strategy</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select strategy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="OPTIMIZE_PICK_PATH">OPTIMIZE_PICK_PATH</SelectItem>
                                  <SelectItem value="FIFO">FIFO</SelectItem>
                                  <SelectItem value="LIFO">LIFO</SelectItem>
                                  <SelectItem value="ZONE_BASED">ZONE_BASED</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sortingStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sorting Strategy</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sorting strategy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BY_LOCATION">BY_LOCATION</SelectItem>
                                  <SelectItem value="BY_PRIORITY">BY_PRIORITY</SelectItem>
                                  <SelectItem value="BY_QUANTITY">BY_QUANTITY</SelectItem>
                                  <SelectItem value="BY_SKU">BY_SKU</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="loadingStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loading Strategy</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select loading strategy" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="LOAD_BY_LM_TRIP">LOAD_BY_LM_TRIP</SelectItem>
                                  <SelectItem value="LOAD_BY_ZONE">LOAD_BY_ZONE</SelectItem>
                                  <SelectItem value="LOAD_BY_CAPACITY">LOAD_BY_CAPACITY</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BATCH">BATCH</SelectItem>
                                  <SelectItem value="SINGLE">SINGLE</SelectItem>
                                  <SelectItem value="CLUSTER">CLUSTER</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="taskLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional task label" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="searchScope"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Search Scope</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select search scope" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AREA">AREA</SelectItem>
                                  <SelectItem value="ZONE">ZONE</SelectItem>
                                  <SelectItem value="WH">WAREHOUSE</SelectItem>
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
                              <FormLabel>Optimization Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select optimization mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TOUCH">TOUCH</SelectItem>
                                  <SelectItem value="DISTANCE">DISTANCE</SelectItem>
                                  <SelectItem value="TIME">TIME</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="orderByQuantUpdatedAt"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Order by Quantity Updated</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="preferFixed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Prefer Fixed Locations</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="orderByPickingPosition"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Order by Picking Position</FormLabel>
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
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Existing Configurations */}
        <Card>
          <CardHeader>
            <CardTitle>Current Task Planning Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {configurations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No task planning configurations yet.</p>
                <p className="text-sm">Click "Add Configuration" to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration Name</TableHead>
                    <TableHead>Inventory Group</TableHead>
                    <TableHead>Task Kind</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.configurationName}</TableCell>
                      <TableCell>{getInventoryGroupName(config.inventoryGroupId)}</TableCell>
                      <TableCell>
                        {config.taskKind ? (
                          <Badge variant="outline">{config.taskKind}</Badge>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.strat ? (
                          <Badge variant="secondary">{config.strat}</Badge>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{config.priority || 'Default'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(config.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation('/step/3')}>
            Previous: Task Sequences
          </Button>
          <Button onClick={handleContinue}>
            Next: Task Execution
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}