import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download, RefreshCw, Trash2, Edit, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import IdentifierFieldset from './components/IdentifierFieldset';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { FieldStatusIndicator, FieldStatusLegend } from '@/components/FieldStatusIndicator';
import { TaskStrategyFormData, TaskStrategyConfig } from '@/types/outbound-v05';
import { useV05FormOptions } from '@/hooks/useV05FormOptions';

// Multi-select component for HU Kinds
function MultiSelectHUKinds({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const formOptions = useV05FormOptions();
  
  const toggleHUKind = (huKind: string) => {
    const newValue = value.includes(huKind) 
      ? value.filter(h => h !== huKind)
      : [...value, huKind];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {formOptions.huKinds.map((huKind) => (
          <Badge
            key={huKind}
            variant={value.includes(huKind) ? 'default' : 'outline'}
            className={`cursor-pointer ${
              value.includes(huKind) 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleHUKind(huKind)}
          >
            {huKind}
          </Badge>
        ))}
      </div>
      {value.length === 0 && (
        <p className="text-sm text-red-500">Select at least one HU kind</p>
      )}
    </div>
  );
}

// Multi-select component for Group By options
function MultiSelectGroupBy({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const formOptions = useV05FormOptions();
  
  const toggleGroupBy = (option: string) => {
    const newValue = value.includes(option) 
      ? value.filter(o => o !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {formOptions.groupByOptions.map((option) => (
          <Badge
            key={option}
            variant={value.includes(option) ? 'default' : 'outline'}
            className={`cursor-pointer ${
              value.includes(option) 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleGroupBy(option)}
          >
            {option}
          </Badge>
        ))}
      </div>
    </div>
  );
}

const taskStrategySchema = z.object({
  // Identifiers
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
  locationIdentifiers: z.object({
    area: z.string().optional(),
    zone: z.string().optional(),
    aisle: z.string().optional(),
    bin: z.string().optional(),
  }),
  
  // Planning
  taskKind: z.string().min(1, 'Task kind is required'),
  taskSubKind: z.string(),
  taskAttrs: z.record(z.any()).default({}),
  strat: z.string(),
  sortingStrategy: z.string(),
  loadingStrategy: z.string(),
  groupBy: z.array(z.string()),
  
  // Execution & HU
  sequence: z.number().min(0, 'Sequence must be 0 or greater'),
  taskLabel: z.string().min(1, 'Task label is required'),
  tripType: z.string(),
  huKinds: z.array(z.string()).min(1, 'At least one HU kind must be selected'),
  mapSegregationGroupsToBins: z.boolean(),
  dropHUInBin: z.boolean(),
  scanDestHUInDrop: z.boolean(),
  allowHUBreakInDrop: z.boolean(),
  scanSourceHUKind: z.string(),
  pickSourceHUKind: z.string(),
  carrierHUKind: z.string(),
  huMappingMode: z.string(),
  useDockdoorAssignment: z.boolean(),
  params: z.record(z.any()).default({}),
  dropHUQuantThreshold: z.number().min(0),
  strictBatchAdherence: z.boolean(),
  allowWorkOrderSplit: z.boolean(),
  undoOp: z.boolean(),
  disableWorkOrder: z.boolean(),
  allowUnpick: z.boolean(),
  supportPalletScan: z.boolean(),
  loadingUnits: z.array(z.any()).default([]),
  pickMandatoryScan: z.boolean(),
  dropMandatoryScan: z.boolean(),
  dropUOM: z.string(),
  allowComplete: z.boolean(),
  swapHUThreshold: z.number().min(0),
  dropInnerHU: z.boolean(),
  allowInnerHUBreak: z.boolean(),
  displayDropUOM: z.boolean(),
  autoUOMConversion: z.boolean(),
  mobileSorting: z.boolean(),
  sortingParam: z.string(),
  huWeightThreshold: z.number().min(0),
  qcMismatchMonthThreshold: z.number().min(0),
  quantSlottingForHUsInDrop: z.boolean(),
  allowPickingMultiBatchfromHU: z.boolean(),
  displayEditPickQuantity: z.boolean(),
  pickBundles: z.boolean(),
  groupByValues: z.record(z.any()).default({}),
  enableEditQtyInPickOp: z.boolean(),
  dropSlottingMode: z.string(),
  enableManualDestBinSelection: z.boolean(),
  interimStrat: z.string(),
  enableLabelPrint: z.boolean(),
  ignorePreferredHUKind: z.boolean(),
  recordExcessAsQuality: z.boolean(),
});

export default function TaskStrategyV05() {
  const { state } = useWizard();
  const { toast } = useToast();
  const formOptions = useV05FormOptions();
  const [taskStrategyConfigs, setTaskStrategyConfigs] = useState<TaskStrategyConfig[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaskStrategyConfig | null>(null);
  const fetchedConfigs = useFetchedConfigurations();
  const { configuration, saveFormChanges, hasUnsavedChanges } = useConfiguration();
  const [expandedSections, setExpandedSections] = useState<string[]>(['planning', 'execution']);

  // Create dynamic default values from central store (fetched data)
  const getDynamicDefaults = (): TaskStrategyFormData => {
    // If we have configurations in central store, use the first one as template
    if (configuration.taskStrategy.length > 0) {
      const firstConfig = configuration.taskStrategy[0];
      return {
        storageIdentifiers: firstConfig.storageIdentifiers || {},
        lineIdentifiers: firstConfig.lineIdentifiers || {},
        locationIdentifiers: firstConfig.locationIdentifiers || {},
        taskKind: firstConfig.taskKind || '',
        taskSubKind: firstConfig.taskSubKind || '',
        taskAttrs: firstConfig.taskAttrs || {},
        strat: firstConfig.strat || '',
        sortingStrategy: firstConfig.sortingStrategy || '',
        loadingStrategy: firstConfig.loadingStrategy || '',
        groupBy: firstConfig.groupBy || [],
        sequence: firstConfig.sequence || 0,
        taskLabel: firstConfig.taskLabel || '',
        tripType: firstConfig.tripType || '',
        huKinds: firstConfig.huKinds || [],
        mapSegregationGroupsToBins: firstConfig.mapSegregationGroupsToBins ?? false,
        dropHUInBin: firstConfig.dropHUInBin ?? false,
        scanDestHUInDrop: firstConfig.scanDestHUInDrop ?? false,
        allowHUBreakInDrop: firstConfig.allowHUBreakInDrop ?? false,
        scanSourceHUKind: firstConfig.scanSourceHUKind || '',
        pickSourceHUKind: firstConfig.pickSourceHUKind || '',
        carrierHUKind: firstConfig.carrierHUKind || '',
        huMappingMode: firstConfig.huMappingMode || '',
        useDockdoorAssignment: firstConfig.useDockdoorAssignment ?? false,
        params: firstConfig.params || {},
        dropHUQuantThreshold: firstConfig.dropHUQuantThreshold || 0,
        strictBatchAdherence: firstConfig.strictBatchAdherence ?? false,
        allowWorkOrderSplit: firstConfig.allowWorkOrderSplit ?? false,
        undoOp: firstConfig.undoOp ?? false,
        disableWorkOrder: firstConfig.disableWorkOrder ?? false,
        allowUnpick: firstConfig.allowUnpick ?? false,
        supportPalletScan: firstConfig.supportPalletScan ?? false,
        loadingUnits: firstConfig.loadingUnits || [],
        pickMandatoryScan: firstConfig.pickMandatoryScan ?? false,
        dropMandatoryScan: firstConfig.dropMandatoryScan ?? false,
        dropUOM: firstConfig.dropUOM || '',
        allowComplete: firstConfig.allowComplete ?? false,
        swapHUThreshold: firstConfig.swapHUThreshold || 0,
        dropInnerHU: firstConfig.dropInnerHU ?? false,
        allowInnerHUBreak: firstConfig.allowInnerHUBreak ?? false,
        displayDropUOM: firstConfig.displayDropUOM ?? false,
        autoUOMConversion: firstConfig.autoUOMConversion ?? false,
        mobileSorting: firstConfig.mobileSorting ?? false,
        sortingParam: firstConfig.sortingParam || '',
        huWeightThreshold: firstConfig.huWeightThreshold || 0,
        qcMismatchMonthThreshold: firstConfig.qcMismatchMonthThreshold || 0,
        quantSlottingForHUsInDrop: firstConfig.quantSlottingForHUsInDrop ?? false,
        allowPickingMultiBatchfromHU: firstConfig.allowPickingMultiBatchfromHU ?? false,
        displayEditPickQuantity: firstConfig.displayEditPickQuantity ?? false,
        pickBundles: firstConfig.pickBundles ?? false,
        groupByValues: firstConfig.groupByValues || {},
        enableEditQtyInPickOp: firstConfig.enableEditQtyInPickOp ?? false,
        dropSlottingMode: firstConfig.dropSlottingMode || '',
        enableManualDestBinSelection: firstConfig.enableManualDestBinSelection ?? false,
        interimStrat: firstConfig.interimStrat || '',
        enableLabelPrint: firstConfig.enableLabelPrint ?? false,
        ignorePreferredHUKind: firstConfig.ignorePreferredHUKind ?? false,
        recordExcessAsQuality: firstConfig.recordExcessAsQuality ?? false,
      };
    }
    
    // Empty defaults when no central store data exists
    return {
      storageIdentifiers: {},
      lineIdentifiers: {},
      locationIdentifiers: {},
      taskKind: '',
      taskSubKind: '',
      taskAttrs: {},
      strat: '',
      sortingStrategy: '',
      loadingStrategy: '',
      groupBy: [],
      sequence: 0,
      taskLabel: '',
      tripType: '',
      huKinds: [],
      mapSegregationGroupsToBins: false,
      dropHUInBin: false,
      scanDestHUInDrop: false,
      allowHUBreakInDrop: false,
      scanSourceHUKind: '',
      pickSourceHUKind: '',
      carrierHUKind: '',
      huMappingMode: '',
      useDockdoorAssignment: false,
      params: {},
      dropHUQuantThreshold: 0,
      strictBatchAdherence: false,
      allowWorkOrderSplit: false,
      undoOp: false,
      disableWorkOrder: false,
      allowUnpick: false,
      supportPalletScan: false,
      loadingUnits: [],
      pickMandatoryScan: false,
      dropMandatoryScan: false,
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
      groupByValues: {},
      enableEditQtyInPickOp: false,
      dropSlottingMode: '',
      enableManualDestBinSelection: false,
      interimStrat: '',
      enableLabelPrint: false,
      ignorePreferredHUKind: false,
      recordExcessAsQuality: false,
    };
  };

  const form = useForm<TaskStrategyFormData>({
    resolver: zodResolver(taskStrategySchema),
    defaultValues: getDynamicDefaults()
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Load configurations from central store and sync changes
  useEffect(() => {
    setTaskStrategyConfigs(configuration.taskStrategy);
  }, [configuration.taskStrategy]);

  // Reinitialize form when central store data changes (from fetched configs)
  useEffect(() => {
    if (!editingConfig) {
      form.reset(getDynamicDefaults());
    }
  }, [configuration.taskStrategy, editingConfig]);




  const onSubmit = (data: TaskStrategyFormData) => {
    const newConfig: TaskStrategyConfig = {
      id: editingConfig?.id || crypto.randomUUID(),
      whId: state.warehouseCode ? parseInt(state.warehouseCode) : undefined,
      ...data,
    };

    let updatedConfigs;
    if (editingConfig) {
      updatedConfigs = taskStrategyConfigs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
      toast({ title: 'Success', description: 'Task strategy configuration updated successfully' });
    } else {
      updatedConfigs = [...taskStrategyConfigs, newConfig];
      toast({ title: 'Success', description: 'Task strategy configuration created successfully' });
    }

    // Update local state AND central store immediately
    setTaskStrategyConfigs(updatedConfigs);
    saveFormChanges('taskStrategy', updatedConfigs);

    form.reset();
    setIsFormVisible(false);
    setEditingConfig(null);
  };

  const handleEdit = (config: TaskStrategyConfig) => {
    setEditingConfig(config);
    form.reset(config);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    const updatedConfigs = taskStrategyConfigs.filter(config => config.id !== id);
    // Update local state AND central store immediately
    setTaskStrategyConfigs(updatedConfigs);
    saveFormChanges('taskStrategy', updatedConfigs);
    toast({ title: 'Success', description: 'Task strategy configuration deleted successfully' });
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleSaveFormChanges = () => {
    saveFormChanges('taskStrategy', taskStrategyConfigs);
    toast({ 
      title: 'Form Changes Saved', 
      description: `${taskStrategyConfigs.length} task strategy configurations saved to central store.`,
    });
  };

  const getDisplayText = (config: TaskStrategyConfig) => {
    const identifierCount = [
      ...Object.values(config.storageIdentifiers).filter(Boolean),
      ...Object.values(config.lineIdentifiers).filter(Boolean),
      ...Object.values(config.locationIdentifiers).filter(Boolean)
    ].length;

    return {
      identifierText: identifierCount > 0 ? `${identifierCount} filters` : 'No filters',
      taskText: `${config.taskKind}${config.taskSubKind ? ` (${config.taskSubKind})` : ''}`,
      strategyText: `${config.strat} | ${config.sortingStrategy} | ${config.loadingStrategy}`,
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Task Strategy Configuration</h1>
            {state.warehouseCode && (
              <Badge variant="outline">Warehouse: {state.warehouseCode}</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveFormChanges} 
              variant={hasUnsavedChanges ? "default" : "outline"}
              className={hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}
            >
              {hasUnsavedChanges ? 'Save Form Changes' : 'Form Changes Saved'}
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
                <strong>Task Strategy Configuration</strong> defines detailed execution strategies for different task types. 
                Configure picking strategies, HU handling, and operational parameters for optimal warehouse operations.
              </div>
              {(fetchedConfigs.data.taskStrategy.length > 0 || fetchedConfigs.fetchedAt) && (
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
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Task Strategy Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Identifiers */}
                  <IdentifierFieldset 
                    control={form.control}
                    showLocationIdentifiers={true}
                    title="Identifiers"
                    configType="taskStrategy"
                    configIndex={0}
                  />

                  <Separator />

                  {/* Planning Section */}
                  <Collapsible open={expandedSections.includes('planning')} onOpenChange={() => toggleSection('planning')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <h4 className="text-sm font-medium text-gray-900">Planning Configuration</h4>
                        {expandedSections.includes('planning') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="taskKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Task Kind *</span>
                                <FieldStatusIndicator 
                                  fieldPath="taskStrategy.0.taskKind"
                                  className="ml-1"
                                  currentValue={form.watch('taskKind')}
                                />
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select task kind" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[9999] relative">
                                  {formOptions.taskKinds.map((kind) => (
                                    <SelectItem key={kind} value={kind}>
                                      {kind.replace('_', ' ')}
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
                          name="taskSubKind"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Task Sub Kind</span>
                                <FieldStatusIndicator 
                                  fieldPath="taskStrategy.0.taskSubKind"
                                  className="ml-1"
                                  currentValue={form.watch('taskSubKind')}
                                />
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter task sub kind" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="taskLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Task Label</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter task label" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="strat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Strategy</span>
                                <FieldStatusIndicator 
                                  fieldPath="taskStrategy.0.strat"
                                  className="ml-1"
                                />
                              </FormLabel>
                              <FormControl>
                                <EnhancedSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={["FIFO", "LIFO", "FEFO", "NEAREST"]}
                                  placeholder="Select strategy"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sortingStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Sorting Strategy</span>
                                <FieldStatusIndicator 
                                  fieldPath="taskStrategy.0.sortingStrategy"
                                  className="ml-1"
                                />
                              </FormLabel>
                              <FormControl>
                                <EnhancedSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={["NONE", "ALPHABETICAL", "VELOCITY", "ZONE"]}
                                  placeholder="Select sorting"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="loadingStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2">
                                <span>Loading Strategy</span>
                                <FieldStatusIndicator 
                                  fieldPath="taskStrategy.0.loadingStrategy"
                                  className="ml-1"
                                />
                              </FormLabel>
                              <FormControl>
                                <EnhancedSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  options={["NONE", "WEIGHT_BASED", "VOLUME_BASED", "FRAGILITY"]}
                                  placeholder="Select loading"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="groupBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group By</FormLabel>
                            <FormControl>
                              <MultiSelectGroupBy
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  <Separator />

                  {/* Execution Section */}
                  <Collapsible open={expandedSections.includes('execution')} onOpenChange={() => toggleSection('execution')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                        <h4 className="text-sm font-medium text-gray-900">Execution & HU Configuration</h4>
                        {expandedSections.includes('execution') ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name="sequence"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sequence</FormLabel>
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
                                <SelectContent className="z-[9999] relative">
                                  <SelectItem value="SINGLE">SINGLE</SelectItem>
                                  <SelectItem value="MULTI">MULTI</SelectItem>
                                  <SelectItem value="BATCH">BATCH</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                <SelectContent className="z-[9999] relative">
                                  {formOptions.huKinds.map((kind) => (
                                    <SelectItem key={kind} value={kind}>
                                      {kind}
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
                                <SelectContent className="z-[9999] relative">
                                  <SelectItem value="AUTO">AUTO</SelectItem>
                                  <SelectItem value="MANUAL">MANUAL</SelectItem>
                                  <SelectItem value="HYBRID">HYBRID</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="huKinds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed HU Kinds</FormLabel>
                            <FormControl>
                              <MultiSelectHUKinds
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Boolean switches */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'mapSegregationGroupsToBins', label: 'Map Segregation Groups to Bins' },
                          { name: 'dropHUInBin', label: 'Drop HU in Bin' },
                          { name: 'scanDestHUInDrop', label: 'Scan Destination HU in Drop' },
                          { name: 'allowHUBreakInDrop', label: 'Allow HU Break in Drop' },
                          { name: 'useDockdoorAssignment', label: 'Use Dockdoor Assignment' },
                          { name: 'strictBatchAdherence', label: 'Strict Batch Adherence' },
                          { name: 'allowWorkOrderSplit', label: 'Allow Work Order Split' },
                          { name: 'undoOp', label: 'Undo Operation' },
                          { name: 'disableWorkOrder', label: 'Disable Work Order' },
                          { name: 'allowUnpick', label: 'Allow Unpick' },
                          { name: 'supportPalletScan', label: 'Support Pallet Scan' },
                          { name: 'pickMandatoryScan', label: 'Pick Mandatory Scan' },
                          { name: 'dropMandatoryScan', label: 'Drop Mandatory Scan' },
                          { name: 'allowComplete', label: 'Allow Complete' },
                          { name: 'dropInnerHU', label: 'Drop Inner HU' },
                          { name: 'allowInnerHUBreak', label: 'Allow Inner HU Break' },
                          { name: 'displayDropUOM', label: 'Display Drop UOM' },
                          { name: 'autoUOMConversion', label: 'Auto UOM Conversion' },
                          { name: 'mobileSorting', label: 'Mobile Sorting' },
                          { name: 'quantSlottingForHUsInDrop', label: 'Quant Slotting for HUs in Drop' },
                          { name: 'allowPickingMultiBatchfromHU', label: 'Allow Picking Multi Batch from HU' },
                          { name: 'displayEditPickQuantity', label: 'Display Edit Pick Quantity' },
                          { name: 'pickBundles', label: 'Pick Bundles' },
                          { name: 'enableEditQtyInPickOp', label: 'Enable Edit Qty in Pick Op' },
                          { name: 'enableManualDestBinSelection', label: 'Enable Manual Dest Bin Selection' },
                          { name: 'enableLabelPrint', label: 'Enable Label Print' },
                          { name: 'ignorePreferredHUKind', label: 'Ignore Preferred HU Kind' },
                          { name: 'recordExcessAsQuality', label: 'Record Excess as Quality' },
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
                    </CollapsibleContent>
                  </Collapsible>

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
        {taskStrategyConfigs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Task Strategy Configurations ({taskStrategyConfigs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>HU Kinds</TableHead>
                    <TableHead>Identifiers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskStrategyConfigs
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((config) => {
                      const { identifierText, taskText, strategyText } = getDisplayText(config);
                      return (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.sequence}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{config.taskLabel}</div>
                              <div className="text-sm text-gray-600">{taskText}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{strategyText}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {config.huKinds.map(huKind => (
                                <Badge key={huKind} variant="outline" className="text-xs">
                                  {huKind}
                                </Badge>
                              ))}
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
              <div className="w-12 h-12 text-gray-400 mb-4">⚙️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Strategy Configurations</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first task strategy configuration with auto-populated data from warehouse.
              </p>
              <div className="flex space-x-2">
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
  );
}