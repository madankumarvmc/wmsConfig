import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, CheckCircle, Edit, Package, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  tripTypes,
  huKindOptions,
  scanSourceHUKindOptions,
  uoms,
  huMappingModes,
  dropSlottingModes
} from '@/lib/mockData';

const huFormationSchema = z.object({
  id: z.number().optional(),
  pickStrategyId: z.number(),
  tripType: z.string().min(1, "Trip type is required"),
  huKinds: z.array(z.string()),
  scanSourceHUKind: z.string(),
  pickSourceHUKind: z.string(),
  carrierHUKind: z.string(),
  huMappingMode: z.string().min(1, "HU mapping mode is required"),
  dropHUQuantThreshold: z.number().min(0),
  dropUOM: z.string().min(1, "Drop UOM is required"),
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
  enableEditQtyInPickOp: z.boolean(),
  dropSlottingMode: z.string().min(1, "Drop slotting mode is required"),
  enableManualDestBinSelection: z.boolean()
});

type HUFormation = z.infer<typeof huFormationSchema>;

export default function Step4HUFormation() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);

  const form = useForm<HUFormation>({
    resolver: zodResolver(huFormationSchema),
    defaultValues: {
      tripType: 'LM',
      huKinds: [],
      scanSourceHUKind: 'NONE',
      pickSourceHUKind: 'NONE',
      carrierHUKind: 'NONE',
      huMappingMode: 'BIN',
      dropHUQuantThreshold: 0,
      dropUOM: 'L0',
      allowComplete: true,
      swapHUThreshold: 0,
      dropInnerHU: true,
      allowInnerHUBreak: true,
      displayDropUOM: true,
      autoUOMConversion: true,
      mobileSorting: true,
      sortingParam: '',
      huWeightThreshold: 0,
      qcMismatchMonthThreshold: 0,
      quantSlottingForHUsInDrop: true,
      allowPickingMultiBatchfromHU: true,
      displayEditPickQuantity: true,
      pickBundles: true,
      enableEditQtyInPickOp: true,
      dropSlottingMode: 'BIN',
      enableManualDestBinSelection: true
    }
  });

  const { data: pickStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const { data: huFormations = [] } = useQuery<any[]>({
    queryKey: ['/api/hu-formation'],
  });

  const saveHUFormationMutation = useMutation({
    mutationFn: async (data: HUFormation) => {
      // Check if HU formation already exists for this pick strategy
      const existing = huFormations.find(hf => hf.pickStrategyId === data.pickStrategyId);
      
      if (existing) {
        const response = await apiRequest('PUT', `/api/hu-formation/${existing.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/hu-formation', data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hu-formation'] });
      toast({ title: "HU Formation saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save HU Formation", variant: "destructive" });
    }
  });

  const onSubmit = (data: HUFormation) => {
    if (selectedStrategyId) {
      console.log('Submitting HU Formation:', data);
      saveHUFormationMutation.mutate({
        ...data,
        pickStrategyId: selectedStrategyId
      });
    } else {
      toast({ title: "Please select a pick strategy first", variant: "destructive" });
    }
  };

  const handleSelectStrategy = (strategy: any) => {
    setSelectedStrategyId(strategy.id);
    
    // Load existing HU formation if available
    const existingFormation = huFormations.find(hf => hf.pickStrategyId === strategy.id);
    if (existingFormation) {
      form.reset(existingFormation);
    } else {
      form.reset({
        tripType: 'LM',
        huKinds: [],
        scanSourceHUKind: 'NONE',
        pickSourceHUKind: 'NONE',
        carrierHUKind: 'NONE',
        huMappingMode: 'BIN',
        dropHUQuantThreshold: 0,
        dropUOM: 'L0',
        allowComplete: true,
        swapHUThreshold: 0,
        dropInnerHU: true,
        allowInnerHUBreak: true,
        displayDropUOM: true,
        autoUOMConversion: true,
        mobileSorting: true,
        sortingParam: '',
        huWeightThreshold: 0,
        qcMismatchMonthThreshold: 0,
        quantSlottingForHUsInDrop: true,
        allowPickingMultiBatchfromHU: true,
        displayEditPickQuantity: true,
        pickBundles: true,
        enableEditQtyInPickOp: true,
        dropSlottingMode: 'BIN',
        enableManualDestBinSelection: true
      });
    }
  };

  const addHUKind = (kind: string) => {
    const currentKinds = form.getValues('huKinds');
    if (!currentKinds.includes(kind)) {
      form.setValue('huKinds', [...currentKinds, kind]);
    }
  };

  const removeHUKind = (kind: string) => {
    const currentKinds = form.getValues('huKinds');
    form.setValue('huKinds', currentKinds.filter(k => k !== kind));
  };

  const getStrategyStatus = (strategyId: number) => {
    return huFormations.some(hf => hf.pickStrategyId === strategyId) ? 'configured' : 'pending';
  };

  const configuredStrategiesCount = pickStrategies.filter(strategy => 
    getStrategyStatus(strategy.id) === 'configured'
  ).length;

  const handleNext = () => {
    if (configuredStrategiesCount === 0) {
      toast({ 
        title: "Configuration Required", 
        description: "Please configure HU Formation for at least one pick strategy before proceeding.",
        variant: "destructive" 
      });
      return;
    }
    dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    setLocation('/step4');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2');
  };

  const watchedHUKinds = form.watch('huKinds');

  return (
    <WizardLayout
      title="HU Formation & Path Determination"
      description="Configure handling unit formation and path determination for each pick strategy from Step 2."
      currentStep={3}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Work Orders"
      previousLabel="Previous: Pick Strategies"
    >
      {/* Step Description */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Step 3: HU Formation & Path Determination</strong> - Configure handling unit formation settings for each pick strategy. Select a strategy from the list and define HU kinds, thresholds, and operational parameters.
        </AlertDescription>
      </Alert>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Configuration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">
              {configuredStrategiesCount}/{pickStrategies.length}
            </div>
            <div className="text-sm text-gray-600">
              Pick strategies configured with HU Formation
            </div>
            {configuredStrategiesCount > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ready to proceed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pick Strategies List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pick Strategies</CardTitle>
            <p className="text-sm text-gray-600">Select a strategy to configure</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pickStrategies.map((strategy) => {
                const status = getStrategyStatus(strategy.id);
                const isSelected = selectedStrategyId === strategy.id;
                
                return (
                  <div
                    key={strategy.id}
                    onClick={() => handleSelectStrategy(strategy)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{strategy.taskKind}</div>
                        <div className="text-xs text-gray-500">{strategy.taskSubKind}</div>
                        <div className="text-xs text-gray-500">
                          {strategy.storageIdentifiers.category} • {strategy.lineIdentifiers.channel}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {status === 'configured' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Edit className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {pickStrategies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No pick strategies found.</p>
                  <p className="text-sm">Configure strategies in Step 2 first.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* HU Formation Configuration Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              HU Formation Configuration
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedStrategyId 
                ? `Configuring HU formation for selected pick strategy`
                : 'Select a pick strategy to configure HU formation'
              }
            </p>
          </CardHeader>
          <CardContent>
            {selectedStrategyId ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Trip & HU Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Trip & HU Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tripType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Trip Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tripTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="huMappingMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">HU Mapping Mode</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {huMappingModes.map(mode => (
                                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* HU Kinds */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">HU Kinds</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchedHUKinds?.map((kind) => (
                          <Badge key={kind} variant="secondary" className="flex items-center">
                            {kind}
                            <button
                              type="button"
                              onClick={() => removeHUKind(kind)}
                              className="ml-1 text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addHUKind}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add HU kind" />
                        </SelectTrigger>
                        <SelectContent>
                          {huKindOptions
                            .filter(option => !watchedHUKinds?.includes(option.value))
                            .map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source HU Configuration */}
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="scanSourceHUKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Scan Source HU Kind</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {scanSourceHUKindOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pickSourceHUKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pick Source HU Kind</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {scanSourceHUKindOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carrierHUKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Carrier HU Kind</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {scanSourceHUKindOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Thresholds & Quantities */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Thresholds & Quantities</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dropHUQuantThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Drop HU Quantity Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dropUOM"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Drop UOM</FormLabel>
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
                      
                      <FormField
                        control={form.control}
                        name="swapHUThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Swap HU Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="huWeightThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">HU Weight Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="qcMismatchMonthThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">QC Mismatch Month Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sortingParam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Sorting Parameter</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter sorting parameter" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Operation Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Operation Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allowComplete"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow Complete</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dropInnerHU"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Drop Inner HU</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowInnerHUBreak"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow Inner HU Break</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="displayDropUOM"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Display Drop UOM</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="autoUOMConversion"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Auto UOM Conversion</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mobileSorting"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Mobile Sorting</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quantSlottingForHUsInDrop"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Quant Slotting for HUs in Drop</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowPickingMultiBatchfromHU"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow Picking Multi Batch from HU</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="displayEditPickQuantity"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Display Edit Pick Quantity</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pickBundles"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Pick Bundles</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableEditQtyInPickOp"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Enable Edit Qty in Pick Op</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enableManualDestBinSelection"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Enable Manual Dest Bin Selection</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="dropSlottingMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Drop Slotting Mode</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dropSlottingModes.map(mode => (
                                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="submit"
                      disabled={saveHUFormationMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {saveHUFormationMutation.isPending ? 'Saving...' : 'Save HU Formation'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a Pick Strategy</p>
                <p className="text-sm">Choose a pick strategy from the left panel to configure its HU formation settings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
