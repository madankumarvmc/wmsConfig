import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit, Trash2, Info, CheckCircle, AlertTriangle, Play, Settings, Zap } from 'lucide-react';

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
import type { TaskPlanningConfiguration, TaskExecutionConfiguration, InsertTaskExecutionConfiguration } from '../../../../shared/schema';

const taskExecutionSchema = z.object({
  taskPlanningConfigurationId: z.number().optional(),
  configurationName: z.string().optional(),
  description: z.string().optional(),
  tripType: z.string().optional(),
  huKinds: z.array(z.string()).optional(),
  scanSourceHUKind: z.string().optional(),
  pickSourceHUKind: z.string().optional(),
  carrierHUKind: z.string().optional(),
  huMappingMode: z.string().optional(),
  dropHUQuantThreshold: z.number().optional(),
  dropUOM: z.string().optional(),
  allowComplete: z.boolean().optional(),
  swapHUThreshold: z.number().optional(),
  dropInnerHU: z.boolean().optional(),
  allowInnerHUBreak: z.boolean().optional(),
  displayDropUOM: z.boolean().optional(),
  autoUOMConversion: z.boolean().optional(),
  mobileSorting: z.boolean().optional(),
  sortingParam: z.string().optional(),
  huWeightThreshold: z.number().optional(),
  qcMismatchMonthThreshold: z.number().optional(),
  quantSlottingForHUsInDrop: z.boolean().optional(),
  allowPickingMultiBatchfromHU: z.boolean().optional(),
  displayEditPickQuantity: z.boolean().optional(),
  pickBundles: z.boolean().optional(),
  enableEditQtyInPickOp: z.boolean().optional(),
  dropSlottingMode: z.string().optional(),
  enableManualDestBinSelection: z.boolean().optional(),
  mapSegregationGroupsToBins: z.boolean().optional(),
  dropHUInBin: z.boolean().optional(),
  scanDestHUInDrop: z.boolean().optional(),
  allowHUBreakInDrop: z.boolean().optional(),
  strictBatchAdherence: z.boolean().optional(),
  allowWorkOrderSplit: z.boolean().optional(),
  undoOp: z.boolean().optional(),
  disableWorkOrder: z.boolean().optional(),
  allowUnpick: z.boolean().optional(),
  supportPalletScan: z.boolean().optional(),
  loadingUnits: z.array(z.string()).optional(),
  pickMandatoryScan: z.boolean().optional(),
  dropMandatoryScan: z.boolean().optional(),
});

type TaskExecutionForm = z.infer<typeof taskExecutionSchema>;

export default function Step5TaskExecution() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<TaskExecutionConfiguration | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: taskPlanningConfigs = [] } = useQuery<TaskPlanningConfiguration[]>({
    queryKey: ['/api/task-planning'],
  });

  const { data: configurations = [] } = useQuery<TaskExecutionConfiguration[]>({
    queryKey: ['/api/task-execution'],
  });

  const form = useForm<TaskExecutionForm>({
    resolver: zodResolver(taskExecutionSchema),
    defaultValues: {
      taskPlanningConfigurationId: 0,
      configurationName: '',
      description: '',
      tripType: '',
      huKinds: [],
      scanSourceHUKind: '',
      pickSourceHUKind: '',
      carrierHUKind: '',
      huMappingMode: '',
      dropHUQuantThreshold: 0,
      dropUOM: '',
      allowComplete: false,
      swapHUThreshold: 0,
      dropInnerHU: false,
      allowInnerHUBreak: false,
      displayDropUOM: false,
      autoUOMConversion: false,
      mobileSorting: false,
      sortingParam: '',
      huWeightThreshold: 0,
      qcMismatchMonthThreshold: 0,
      quantSlottingForHUsInDrop: false,
      allowPickingMultiBatchfromHU: false,
      displayEditPickQuantity: false,
      pickBundles: false,
      enableEditQtyInPickOp: false,
      dropSlottingMode: '',
      enableManualDestBinSelection: false,
      mapSegregationGroupsToBins: false,
      dropHUInBin: false,
      scanDestHUInDrop: false,
      allowHUBreakInDrop: false,
      strictBatchAdherence: false,
      allowWorkOrderSplit: false,
      undoOp: false,
      disableWorkOrder: false,
      allowUnpick: false,
      supportPalletScan: false,
      loadingUnits: [],
      pickMandatoryScan: false,
      dropMandatoryScan: false,
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertTaskExecutionConfiguration) => {
      const response = await apiRequest('POST', '/api/task-execution', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution'] });
      toast({
        title: 'Success',
        description: 'Task execution configuration saved successfully.',
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save task execution configuration.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/task-execution/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution'] });
      toast({
        title: 'Success',
        description: 'Task execution configuration deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete task execution configuration.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TaskExecutionForm) => {
    const submitData = {
      ...data,
      huKinds: data.huKinds?.length ? data.huKinds : undefined,
      loadingUnits: data.loadingUnits?.length ? data.loadingUnits : undefined,
    };
    saveMutation.mutate(submitData);
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleEdit = (config: TaskExecutionConfiguration) => {
    setEditingConfig(config);
    setIsFormVisible(true);
    form.reset({
      taskPlanningConfigurationId: config.taskPlanningConfigurationId,
      configurationName: config.configurationName,
      description: config.description || '',
      tripType: config.tripType || '',
      huKinds: config.huKinds || [],
      scanSourceHUKind: config.scanSourceHUKind || '',
      pickSourceHUKind: config.pickSourceHUKind || '',
      carrierHUKind: config.carrierHUKind || '',
      huMappingMode: config.huMappingMode || '',
      dropHUQuantThreshold: config.dropHUQuantThreshold || 0,
      dropUOM: config.dropUOM || '',
      allowComplete: config.allowComplete || false,
      swapHUThreshold: config.swapHUThreshold || 0,
      dropInnerHU: config.dropInnerHU || false,
      allowInnerHUBreak: config.allowInnerHUBreak || false,
      displayDropUOM: config.displayDropUOM || false,
      autoUOMConversion: config.autoUOMConversion || false,
      mobileSorting: config.mobileSorting || false,
      sortingParam: config.sortingParam || '',
      huWeightThreshold: config.huWeightThreshold || 0,
      qcMismatchMonthThreshold: config.qcMismatchMonthThreshold || 0,
      quantSlottingForHUsInDrop: config.quantSlottingForHUsInDrop || false,
      allowPickingMultiBatchfromHU: config.allowPickingMultiBatchfromHU || false,
      displayEditPickQuantity: config.displayEditPickQuantity || false,
      pickBundles: config.pickBundles || false,
      enableEditQtyInPickOp: config.enableEditQtyInPickOp || false,
      dropSlottingMode: config.dropSlottingMode || '',
      enableManualDestBinSelection: config.enableManualDestBinSelection || false,
      mapSegregationGroupsToBins: config.mapSegregationGroupsToBins || false,
      dropHUInBin: config.dropHUInBin || false,
      scanDestHUInDrop: config.scanDestHUInDrop || false,
      allowHUBreakInDrop: config.allowHUBreakInDrop || false,
      strictBatchAdherence: config.strictBatchAdherence || false,
      allowWorkOrderSplit: config.allowWorkOrderSplit || false,
      undoOp: config.undoOp || false,
      disableWorkOrder: config.disableWorkOrder || false,
      allowUnpick: config.allowUnpick || false,
      supportPalletScan: config.supportPalletScan || false,
      loadingUnits: config.loadingUnits || [],
      pickMandatoryScan: config.pickMandatoryScan || false,
      dropMandatoryScan: config.dropMandatoryScan || false,
    });
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 5 });
    setLocation('/step/6');
  };

  const getTaskPlanningName = (id: number) => {
    const config = taskPlanningConfigs.find(c => c.id === id);
    return config?.configurationName || `Config ${id}`;
  };

  // Check if a task planning config already has an execution config
  const getAvailableTaskPlanningConfigs = () => {
    return taskPlanningConfigs.filter(config => 
      !configurations.some(exec => exec.taskPlanningConfigurationId === config.id)
    );
  };

  return (
    <WizardLayout 
      currentStep={5} 
      title="Task Execution Configuration"
      description="Configure task execution parameters for task planning strategies"
    >
      <div className="space-y-6">
        {/* Header and Add Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold">Task Execution Strategies</h2>
          </div>
          <Button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center gap-2"
            disabled={getAvailableTaskPlanningConfigs().length === 0}
          >
            <Plus className="w-4 h-4" />
            Add Configuration
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            Task execution configurations define how tasks are executed for each task planning strategy. 
            Only one execution strategy per task planning strategy is allowed. All fields are optional.
          </AlertDescription>
        </Alert>

        {getAvailableTaskPlanningConfigs().length === 0 && taskPlanningConfigs.length > 0 && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              All task planning configurations already have execution strategies assigned. 
              To add a new execution strategy, you need to create a task planning configuration first.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Form */}
        {isFormVisible && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {editingConfig ? 'Edit Task Execution Configuration' : 'New Task Execution Configuration'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                      <TabsTrigger value="hu">Handling Units</TabsTrigger>
                      <TabsTrigger value="operations">Operations</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="taskPlanningConfigurationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Planning Configuration</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select task planning config" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {getAvailableTaskPlanningConfigs().map((config) => (
                                    <SelectItem key={config.id} value={config.id.toString()}>
                                      {config.configurationName}
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
                          name="tripType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Trip Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select trip type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="LM">LM</SelectItem>
                                  <SelectItem value="RF">RF</SelectItem>
                                  <SelectItem value="BATCH">BATCH</SelectItem>
                                  <SelectItem value="CLUSTER">CLUSTER</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropUOM"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Drop UOM</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select drop UOM" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="L0">L0</SelectItem>
                                  <SelectItem value="L1">L1</SelectItem>
                                  <SelectItem value="L2">L2</SelectItem>
                                  <SelectItem value="L3">L3</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sortingParam"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sorting Parameter</FormLabel>
                              <FormControl>
                                <Input placeholder="Optional sorting param" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="hu" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="scanSourceHUKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scan Source HU Kind</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select scan source HU" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PALLET">PALLET</SelectItem>
                                  <SelectItem value="TOTE">TOTE</SelectItem>
                                  <SelectItem value="CART">CART</SelectItem>
                                  <SelectItem value="NONE">NONE</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pickSourceHUKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pick Source HU Kind</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pick source HU" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PALLET">PALLET</SelectItem>
                                  <SelectItem value="TOTE">TOTE</SelectItem>
                                  <SelectItem value="CART">CART</SelectItem>
                                  <SelectItem value="NONE">NONE</SelectItem>
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
                          name="carrierHUKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Carrier HU Kind</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select carrier HU" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PALLET">PALLET</SelectItem>
                                  <SelectItem value="TOTE">TOTE</SelectItem>
                                  <SelectItem value="CART">CART</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="huMappingMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HU Mapping Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select mapping mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BIN">BIN</SelectItem>
                                  <SelectItem value="ZONE">ZONE</SelectItem>
                                  <SelectItem value="AREA">AREA</SelectItem>
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
                          name="dropHUQuantThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Drop HU Quantity Threshold</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="swapHUThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Swap HU Threshold</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="huWeightThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HU Weight Threshold</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="operations" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="allowComplete"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Allow Complete</FormLabel>
                                <p className="text-xs text-gray-500">Enable task completion</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropInnerHU"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Drop Inner HU</FormLabel>
                                <p className="text-xs text-gray-500">Allow dropping inner handling units</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="allowInnerHUBreak"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Allow Inner HU Break</FormLabel>
                                <p className="text-xs text-gray-500">Enable breaking inner handling units</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="autoUOMConversion"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Auto UOM Conversion</FormLabel>
                                <p className="text-xs text-gray-500">Automatic unit of measure conversion</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mobileSorting"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Mobile Sorting</FormLabel>
                                <p className="text-xs text-gray-500">Enable mobile device sorting</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="displayEditPickQuantity"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Display Edit Pick Quantity</FormLabel>
                                <p className="text-xs text-gray-500">Allow editing pick quantities</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pickMandatoryScan"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Pick Mandatory Scan</FormLabel>
                                <p className="text-xs text-gray-500">Require scanning during pick operations</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dropMandatoryScan"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Drop Mandatory Scan</FormLabel>
                                <p className="text-xs text-gray-500">Require scanning during drop operations</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dropSlottingMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Drop Slotting Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select drop slotting mode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="BIN">BIN</SelectItem>
                                  <SelectItem value="ZONE">ZONE</SelectItem>
                                  <SelectItem value="AREA">AREA</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="qcMismatchMonthThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>QC Mismatch Month Threshold</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="strictBatchAdherence"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Strict Batch Adherence</FormLabel>
                                <p className="text-xs text-gray-500">Enforce strict batch processing rules</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allowWorkOrderSplit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Allow Work Order Split</FormLabel>
                                <p className="text-xs text-gray-500">Enable splitting work orders</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="supportPalletScan"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Support Pallet Scan</FormLabel>
                                <p className="text-xs text-gray-500">Enable pallet scanning capabilities</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="undoOp"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium text-gray-900">Undo Operation</FormLabel>
                                <p className="text-xs text-gray-500">Allow undoing task operations</p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value || false}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-blue-600"
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
            <CardTitle>Current Task Execution Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            {configurations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No task execution configurations yet.</p>
                <p className="text-sm">Click "Add Configuration" to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration Name</TableHead>
                    <TableHead>Task Planning</TableHead>
                    <TableHead>Trip Type</TableHead>
                    <TableHead>Carrier HU</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.configurationName}</TableCell>
                      <TableCell>{getTaskPlanningName(config.taskPlanningConfigurationId)}</TableCell>
                      <TableCell>
                        {config.tripType ? (
                          <Badge variant="outline">{config.tripType}</Badge>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {config.carrierHUKind ? (
                          <Badge variant="secondary">{config.carrierHUKind}</Badge>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
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
          <Button variant="outline" onClick={() => setLocation('/step/4')}>
            Previous: Task Planning
          </Button>
          <Button onClick={handleContinue}>
            Next: Review & Confirm
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}