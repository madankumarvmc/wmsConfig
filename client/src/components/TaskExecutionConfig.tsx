import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cog, Plus, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { TaskExecutionConfiguration, InsertTaskExecutionConfiguration } from '../../../shared/schema';

const taskExecutionSchema = z.object({
  tripType: z.string().min(1, 'Trip Type is required'),
  scanSourceHUKind: z.string().min(1, 'Scan Source HU Kind is required'),
  pickSourceHUKind: z.string().min(1, 'Pick Source HU Kind is required'),
  carrierHUKind: z.string().min(1, 'Carrier HU Kind is required'),
  huMappingMode: z.string().min(1, 'HU Mapping Mode is required'),
  dropHUQuantThreshold: z.number().min(0, 'Drop HU Quant Threshold must be non-negative'),
  dropUOM: z.string().min(1, 'Drop UOM is required'),
  swapHUThreshold: z.number().min(0, 'Swap HU Threshold must be non-negative'),
  sortingParam: z.string().min(1, 'Sorting Param is required'),
  huWeightThreshold: z.number().min(0, 'HU Weight Threshold must be non-negative'),
  qcMismatchMonthThreshold: z.number().min(0, 'QC Mismatch Month Threshold must be non-negative'),
  dropSlottingMode: z.string().min(1, 'Drop Slotting Mode is required'),
  allowComplete: z.boolean(),
  dropInnerHU: z.boolean(),
  allowInnerHUBreak: z.boolean(),
  displayDropUOM: z.boolean(),
  autoUOMConversion: z.boolean(),
  mobileSorting: z.boolean(),
  quantSlottingForHUsInDrop: z.boolean(),
  allowPickingMultiBatchfromHU: z.boolean(),
  displayEditPickQuantity: z.boolean(),
  pickBundles: z.boolean(),
  enableEditQtyInPickOp: z.boolean(),
  enableManualDestBinSelection: z.boolean(),
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
  pickMandatoryScan: z.boolean(),
  dropMandatoryScan: z.boolean(),
});

type TaskExecutionForm = z.infer<typeof taskExecutionSchema>;

interface TaskExecutionConfigProps {
  inventoryGroupId: number;
  inventoryGroupName: string;
}

const tripTypeOptions = ['LM', 'LT', 'PT', 'MT'];
const huKindOptions = ['NONE', 'PALLET', 'CRATE', 'BOX', 'TOTE'];
const huMappingModeOptions = ['BIN', 'ZONE', 'AREA'];
const dropUOMOptions = ['L0', 'L1', 'L2', 'L3'];
const dropSlottingModeOptions = ['BIN', 'ZONE', 'AREA', 'NONE'];
const loadingUnitsOptions = ['CRATE', 'PALLET', 'TOTE', 'BOX'];

export default function TaskExecutionConfig({ inventoryGroupId, inventoryGroupName }: TaskExecutionConfigProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: configuration, isLoading } = useQuery<TaskExecutionConfiguration | null>({
    queryKey: ['/api/task-execution/by-group', inventoryGroupId],
  });

  const form = useForm<TaskExecutionForm>({
    resolver: zodResolver(taskExecutionSchema),
    defaultValues: {
      tripType: configuration?.tripType || 'LM',
      scanSourceHUKind: configuration?.scanSourceHUKind || 'NONE',
      pickSourceHUKind: configuration?.pickSourceHUKind || 'NONE',
      carrierHUKind: configuration?.carrierHUKind || 'NONE',
      huMappingMode: configuration?.huMappingMode || 'BIN',
      dropHUQuantThreshold: configuration?.dropHUQuantThreshold || 0,
      dropUOM: configuration?.dropUOM || 'L0',
      swapHUThreshold: configuration?.swapHUThreshold || 0,
      sortingParam: configuration?.sortingParam || 'default',
      huWeightThreshold: configuration?.huWeightThreshold || 0,
      qcMismatchMonthThreshold: configuration?.qcMismatchMonthThreshold || 0,
      dropSlottingMode: configuration?.dropSlottingMode || 'BIN',
      allowComplete: configuration?.allowComplete ?? true,
      dropInnerHU: configuration?.dropInnerHU ?? true,
      allowInnerHUBreak: configuration?.allowInnerHUBreak ?? true,
      displayDropUOM: configuration?.displayDropUOM ?? true,
      autoUOMConversion: configuration?.autoUOMConversion ?? true,
      mobileSorting: configuration?.mobileSorting ?? true,
      quantSlottingForHUsInDrop: configuration?.quantSlottingForHUsInDrop ?? true,
      allowPickingMultiBatchfromHU: configuration?.allowPickingMultiBatchfromHU ?? true,
      displayEditPickQuantity: configuration?.displayEditPickQuantity ?? true,
      pickBundles: configuration?.pickBundles ?? true,
      enableEditQtyInPickOp: configuration?.enableEditQtyInPickOp ?? true,
      enableManualDestBinSelection: configuration?.enableManualDestBinSelection ?? true,
      mapSegregationGroupsToBins: configuration?.mapSegregationGroupsToBins ?? true,
      dropHUInBin: configuration?.dropHUInBin ?? true,
      scanDestHUInDrop: configuration?.scanDestHUInDrop ?? true,
      allowHUBreakInDrop: configuration?.allowHUBreakInDrop ?? true,
      strictBatchAdherence: configuration?.strictBatchAdherence ?? true,
      allowWorkOrderSplit: configuration?.allowWorkOrderSplit ?? true,
      undoOp: configuration?.undoOp ?? true,
      disableWorkOrder: configuration?.disableWorkOrder ?? true,
      allowUnpick: configuration?.allowUnpick ?? true,
      supportPalletScan: configuration?.supportPalletScan ?? true,
      pickMandatoryScan: configuration?.pickMandatoryScan ?? true,
      dropMandatoryScan: configuration?.dropMandatoryScan ?? true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: TaskExecutionForm) => {
      const payload: InsertTaskExecutionConfiguration = {
        inventoryGroupId,
        ...data,
        huKinds: [],
        loadingUnits: ['CRATE'],
      };

      if (configuration) {
        return apiRequest(`/api/task-execution/${configuration.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest('/api/task-execution', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution/by-group', inventoryGroupId] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task execution configuration saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save task execution configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskExecutionForm) => {
    saveMutation.mutate(data);
  };

  const handleEdit = () => {
    if (configuration) {
      form.reset({
        tripType: configuration.tripType,
        scanSourceHUKind: configuration.scanSourceHUKind,
        pickSourceHUKind: configuration.pickSourceHUKind,
        carrierHUKind: configuration.carrierHUKind,
        huMappingMode: configuration.huMappingMode,
        dropHUQuantThreshold: configuration.dropHUQuantThreshold,
        dropUOM: configuration.dropUOM,
        swapHUThreshold: configuration.swapHUThreshold,
        sortingParam: configuration.sortingParam,
        huWeightThreshold: configuration.huWeightThreshold,
        qcMismatchMonthThreshold: configuration.qcMismatchMonthThreshold,
        dropSlottingMode: configuration.dropSlottingMode,
        allowComplete: configuration.allowComplete,
        dropInnerHU: configuration.dropInnerHU,
        allowInnerHUBreak: configuration.allowInnerHUBreak,
        displayDropUOM: configuration.displayDropUOM,
        autoUOMConversion: configuration.autoUOMConversion,
        mobileSorting: configuration.mobileSorting,
        quantSlottingForHUsInDrop: configuration.quantSlottingForHUsInDrop,
        allowPickingMultiBatchfromHU: configuration.allowPickingMultiBatchfromHU,
        displayEditPickQuantity: configuration.displayEditPickQuantity,
        pickBundles: configuration.pickBundles,
        enableEditQtyInPickOp: configuration.enableEditQtyInPickOp,
        enableManualDestBinSelection: configuration.enableManualDestBinSelection,
        mapSegregationGroupsToBins: configuration.mapSegregationGroupsToBins,
        dropHUInBin: configuration.dropHUInBin,
        scanDestHUInDrop: configuration.scanDestHUInDrop,
        allowHUBreakInDrop: configuration.allowHUBreakInDrop,
        strictBatchAdherence: configuration.strictBatchAdherence,
        allowWorkOrderSplit: configuration.allowWorkOrderSplit,
        undoOp: configuration.undoOp,
        disableWorkOrder: configuration.disableWorkOrder,
        allowUnpick: configuration.allowUnpick,
        supportPalletScan: configuration.supportPalletScan,
        pickMandatoryScan: configuration.pickMandatoryScan,
        dropMandatoryScan: configuration.dropMandatoryScan,
      });
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Task Execution Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Task Execution Configuration
          </CardTitle>
          {!isEditing && (
            <Button
              onClick={configuration ? handleEdit : () => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {configuration ? <Cog className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {configuration ? 'Edit' : 'Configure'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing && configuration ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Trip Type:</span>
                <div className="mt-1">{configuration.tripType}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">HU Mapping Mode:</span>
                <div className="mt-1">{configuration.huMappingMode}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Drop UOM:</span>
                <div className="mt-1">{configuration.dropUOM}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Drop Slotting Mode:</span>
                <div className="mt-1">{configuration.dropSlottingMode}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">HU Weight Threshold:</span>
                <div className="mt-1">{configuration.huWeightThreshold}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">QC Mismatch Threshold:</span>
                <div className="mt-1">{configuration.qcMismatchMonthThreshold}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.allowComplete && <Badge variant="secondary">Allow Complete</Badge>}
              {configuration.dropInnerHU && <Badge variant="secondary">Drop Inner HU</Badge>}
              {configuration.allowInnerHUBreak && <Badge variant="secondary">Allow Inner HU Break</Badge>}
              {configuration.autoUOMConversion && <Badge variant="secondary">Auto UOM Conversion</Badge>}
              {configuration.mobileSorting && <Badge variant="secondary">Mobile Sorting</Badge>}
              {configuration.pickBundles && <Badge variant="secondary">Pick Bundles</Badge>}
              {configuration.strictBatchAdherence && <Badge variant="secondary">Strict Batch Adherence</Badge>}
              {configuration.pickMandatoryScan && <Badge variant="secondary">Pick Mandatory Scan</Badge>}
              {configuration.dropMandatoryScan && <Badge variant="secondary">Drop Mandatory Scan</Badge>}
            </div>
          </div>
        ) : (!isEditing && !configuration) ? (
          <div className="text-center py-6 text-gray-500">
            <Cog className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No task execution configuration defined</p>
            <p className="text-xs">Click Configure to set up task execution for this inventory group</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tripTypeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="scanSourceHUKind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scan Source HU Kind *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HU kind" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {huKindOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="pickSourceHUKind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pick Source HU Kind *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HU kind" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {huKindOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="carrierHUKind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrier HU Kind *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HU kind" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {huKindOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                      <FormLabel>HU Mapping Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mapping mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {huMappingModeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="dropUOM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drop UOM *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropUOMOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="dropSlottingMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drop Slotting Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dropSlottingModeOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
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
                  name="sortingParam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sorting Param *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sorting parameter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="dropHUQuantThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drop HU Quant Threshold</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
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
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
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
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
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
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Operation Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="allowComplete"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow Complete</FormLabel>
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
                    name="dropInnerHU"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Drop Inner HU</FormLabel>
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
                    name="allowInnerHUBreak"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow Inner HU Break</FormLabel>
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
                    name="displayDropUOM"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Display Drop UOM</FormLabel>
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
                    name="autoUOMConversion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Auto UOM Conversion</FormLabel>
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
                    name="mobileSorting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Mobile Sorting</FormLabel>
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
                    name="quantSlottingForHUsInDrop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Quant Slotting for HUs in Drop</FormLabel>
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
                    name="allowPickingMultiBatchfromHU"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow Picking Multi Batch from HU</FormLabel>
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
                    name="displayEditPickQuantity"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Display Edit Pick Quantity</FormLabel>
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
                    name="pickBundles"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Pick Bundles</FormLabel>
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
                    name="enableEditQtyInPickOp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Enable Edit Qty in Pick Op</FormLabel>
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
                    name="enableManualDestBinSelection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Enable Manual Dest Bin Selection</FormLabel>
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
                    name="mapSegregationGroupsToBins"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Map Segregation Groups to Bins</FormLabel>
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
                    name="dropHUInBin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Drop HU in Bin</FormLabel>
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
                    name="scanDestHUInDrop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Scan Dest HU in Drop</FormLabel>
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
                    name="allowHUBreakInDrop"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow HU Break in Drop</FormLabel>
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
                    name="strictBatchAdherence"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Strict Batch Adherence</FormLabel>
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
                    name="allowWorkOrderSplit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow Work Order Split</FormLabel>
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
                    name="undoOp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Undo Op</FormLabel>
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
                    name="disableWorkOrder"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Disable Work Order</FormLabel>
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
                    name="allowUnpick"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Allow Unpick</FormLabel>
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
                    name="supportPalletScan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Support Pallet Scan</FormLabel>
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
                    name="pickMandatoryScan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Pick Mandatory Scan</FormLabel>
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
                    name="dropMandatoryScan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Drop Mandatory Scan</FormLabel>
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
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saveMutation.isPending}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}