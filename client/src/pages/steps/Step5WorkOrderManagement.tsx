import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, CheckCircle, Edit, Package, Settings, ClipboardList } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loadingUnitOptions } from '@/lib/mockData';

const workOrderManagementSchema = z.object({
  id: z.number().optional(),
  pickStrategyId: z.number(),
  mapSegregationGroupsToBins: z.boolean(),
  dropHUInBin: z.boolean(),
  scanDestHUInDrop: z.boolean(),
  allowHUBreakInDrop: z.boolean(),
  strictBatchAdherence: z.boolean(),
  allowWorkOrderSplit: z.boolean(),
  undoOp: z.boolean(),
  disableWorkOrder: z.boolean(),
  allowUnpick: z.boolean(),
  supportPalletScan: z.boolean(),
  loadingUnits: z.array(z.string()),
  pickMandatoryScan: z.boolean(),
  dropMandatoryScan: z.boolean()
});

type WorkOrderManagement = z.infer<typeof workOrderManagementSchema>;

export default function Step5WorkOrderManagement() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStrategyId, setSelectedStrategyId] = useState<number | null>(null);

  const form = useForm<WorkOrderManagement>({
    resolver: zodResolver(workOrderManagementSchema),
    defaultValues: {
      mapSegregationGroupsToBins: true,
      dropHUInBin: true,
      scanDestHUInDrop: true,
      allowHUBreakInDrop: true,
      strictBatchAdherence: true,
      allowWorkOrderSplit: true,
      undoOp: true,
      disableWorkOrder: false,
      allowUnpick: true,
      supportPalletScan: true,
      loadingUnits: ['CRATE'],
      pickMandatoryScan: true,
      dropMandatoryScan: true
    }
  });

  const { data: pickStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const { data: workOrderConfigurations = [] } = useQuery<any[]>({
    queryKey: ['/api/work-order-management'],
  });

  const saveWorkOrderMutation = useMutation({
    mutationFn: async (data: WorkOrderManagement) => {
      // Check if work order management already exists for this pick strategy
      const existing = workOrderConfigurations.find(wom => wom.pickStrategyId === data.pickStrategyId);
      
      if (existing) {
        const response = await apiRequest('PUT', `/api/work-order-management/${existing.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/work-order-management', data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-order-management'] });
      toast({ title: "Work Order Management saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save Work Order Management", variant: "destructive" });
    }
  });

  const onSubmit = (data: WorkOrderManagement) => {
    if (selectedStrategyId) {
      console.log('Submitting Work Order Management:', data);
      saveWorkOrderMutation.mutate({
        ...data,
        pickStrategyId: selectedStrategyId
      });
    } else {
      toast({ title: "Please select a pick strategy first", variant: "destructive" });
    }
  };

  const handleSelectStrategy = (strategy: any) => {
    setSelectedStrategyId(strategy.id);
    
    // Load existing work order management if available
    const existingConfig = workOrderConfigurations.find(wom => wom.pickStrategyId === strategy.id);
    if (existingConfig) {
      form.reset(existingConfig);
    } else {
      form.reset({
        mapSegregationGroupsToBins: true,
        dropHUInBin: true,
        scanDestHUInDrop: true,
        allowHUBreakInDrop: true,
        strictBatchAdherence: true,
        allowWorkOrderSplit: true,
        undoOp: true,
        disableWorkOrder: false,
        allowUnpick: true,
        supportPalletScan: true,
        loadingUnits: ['CRATE'],
        pickMandatoryScan: true,
        dropMandatoryScan: true
      });
    }
  };

  const addLoadingUnit = (unit: string) => {
    const currentUnits = form.getValues('loadingUnits');
    if (!currentUnits.includes(unit)) {
      form.setValue('loadingUnits', [...currentUnits, unit]);
    }
  };

  const removeLoadingUnit = (unit: string) => {
    const currentUnits = form.getValues('loadingUnits');
    form.setValue('loadingUnits', currentUnits.filter(u => u !== unit));
  };

  const getStrategyStatus = (strategyId: number) => {
    return workOrderConfigurations.some(wom => wom.pickStrategyId === strategyId) ? 'configured' : 'pending';
  };

  const configuredStrategiesCount = pickStrategies.filter(strategy => 
    getStrategyStatus(strategy.id) === 'configured'
  ).length;

  const handleNext = () => {
    if (configuredStrategiesCount === 0) {
      toast({ 
        title: "Configuration Required", 
        description: "Please configure Work Order Management for at least one pick strategy before proceeding.",
        variant: "destructive" 
      });
      return;
    }
    dispatch({ type: 'COMPLETE_STEP', payload: 4 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    setLocation('/step5');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3');
  };

  const watchedLoadingUnits = form.watch('loadingUnits');

  return (
    <WizardLayout
      title="Work Order Management Strategy"
      description="Configure work order management settings for each pick strategy from Step 2."
      currentStep={5}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Stock Allocation"
      previousLabel="Previous: HU Formation"
    >
      {/* Step Description */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Step 4: Work Order Management Strategy</strong> - Configure work order management settings for each pick strategy. Select a strategy from the list and define operation controls, scanning requirements, and loading units.
        </AlertDescription>
      </Alert>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Configuration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-blue-600">
              {configuredStrategiesCount}/{pickStrategies.length}
            </div>
            <div className="text-sm text-gray-600">
              Pick strategies configured with Work Order Management
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

        {/* Work Order Management Configuration Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Work Order Management Configuration
            </CardTitle>
            <p className="text-sm text-gray-600">
              {selectedStrategyId 
                ? `Configuring work order management for selected pick strategy`
                : 'Select a pick strategy to configure work order management'
              }
            </p>
          </CardHeader>
          <CardContent>
            {selectedStrategyId ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Operation Controls */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Operation Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mapSegregationGroupsToBins"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Map Segregation Groups to Bins</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dropHUInBin"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Drop HU in Bin</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="scanDestHUInDrop"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Scan Dest HU in Drop</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowHUBreakInDrop"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow HU Break in Drop</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="strictBatchAdherence"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Strict Batch Adherence</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowWorkOrderSplit"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow Work Order Split</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Workflow Controls */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Workflow Controls</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="undoOp"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Undo Operation</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="disableWorkOrder"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Disable Work Order</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="allowUnpick"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Allow Unpick</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supportPalletScan"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Support Pallet Scan</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Scanning Requirements */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Scanning Requirements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pickMandatoryScan"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Pick Mandatory Scan</FormLabel>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dropMandatoryScan"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Drop Mandatory Scan</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Loading Units */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Loading Units</h3>
                    <div className="flex flex-wrap gap-2">
                      {watchedLoadingUnits?.map((unit) => (
                        <Badge key={unit} variant="secondary" className="flex items-center">
                          {unit}
                          <button
                            type="button"
                            onClick={() => removeLoadingUnit(unit)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addLoadingUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add loading unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingUnitOptions
                          .filter(option => !watchedLoadingUnits?.includes(option.value))
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
                      disabled={saveWorkOrderMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {saveWorkOrderMutation.isPending ? 'Saving...' : 'Save Work Order Management'}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a Pick Strategy</p>
                <p className="text-sm">Choose a pick strategy from the left panel to configure its work order management settings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}