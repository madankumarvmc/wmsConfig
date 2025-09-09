import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download, Trash2, Edit, AlertCircle } from 'lucide-react';

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

import IdentifierFieldset from './components/IdentifierFieldset';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { LineSplitFormData, LineSplitConfig } from '@/types/outbound-v05';
import { useV05FormOptions } from '@/hooks/useV05FormOptions';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { useFieldStatus } from '@/hooks/useFieldStatus';
import { FieldStatusIndicator, FieldStatusLegend } from '@/components/FieldStatusIndicator';

// Multi-select component for UOMs
function MultiSelectUOMs({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) {
  const formOptions = useV05FormOptions();
  
  const toggleUOM = (uom: string) => {
    const newValue = value.includes(uom) 
      ? value.filter(u => u !== uom)
      : [...value, uom];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {formOptions.uoms.map((uom) => (
          <Badge
            key={uom}
            variant={value.includes(uom) ? 'default' : 'outline'}
            className={`cursor-pointer ${
              value.includes(uom) 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'hover:bg-gray-100'
            }`}
            onClick={() => toggleUOM(uom)}
          >
            {uom}
          </Badge>
        ))}
      </div>
      {value.length === 0 && (
        <p className="text-sm text-red-500">Select at least one UOM level</p>
      )}
    </div>
  );
}

const lineSplitSchema = z.object({
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
  sequence: z.number().min(0, 'Sequence must be 0 or greater'),
  mode: z.string().min(1, 'Mode is required'),
  allowedUOMs: z.array(z.string()).min(1, 'At least one UOM must be selected'),
});

export default function LineSplitV05() {
  const { state } = useWizard();
  const { toast } = useToast();
  const formOptions = useV05FormOptions();
  // Removed: using central store directly instead of local state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LineSplitConfig | null>(null);
  const [editingConfigIndex, setEditingConfigIndex] = useState<number>(-1);
  const fetchedConfigs = useFetchedConfigurations();
  const { configuration, saveFormChanges, hasUnsavedChanges } = useConfiguration();
  
  // Use central store directly instead of local state
  const lineSplitConfigs = configuration.lineSplit;

  // Create dynamic default values from central store (fetched data)
  const getDynamicDefaults = (): LineSplitFormData => {
    // If we have configurations in central store, use the first one as template
    if (configuration.lineSplit.length > 0) {
      const firstConfig = configuration.lineSplit[0];
      return {
        storageIdentifiers: firstConfig.storageIdentifiers || {},
        lineIdentifiers: firstConfig.lineIdentifiers || {},
        sequence: firstConfig.sequence || 0,
        mode: firstConfig.mode || '',
        allowedUOMs: firstConfig.allowedUOMs || [],
      };
    }
    
    // Empty defaults when no central store data exists
    return {
      storageIdentifiers: {},
      lineIdentifiers: {},
      sequence: 0,
      mode: '',
      allowedUOMs: [],
    };
  };

  const form = useForm<LineSplitFormData>({
    resolver: zodResolver(lineSplitSchema),
    defaultValues: getDynamicDefaults()
  });

  // Reinitialize form when central store data changes (from fetched configs)
  useEffect(() => {
    if (!editingConfig) {
      form.reset(getDynamicDefaults());
    }
  }, [configuration.lineSplit, editingConfig]);



  // Function removed - auto-population handles this now

  const onSubmit = (data: LineSplitFormData) => {
    const newConfig: LineSplitConfig = {
      id: editingConfig?.id || crypto.randomUUID(),
      whId: state.warehouseCode ? parseInt(state.warehouseCode) : undefined,
      ...data,
      mode: data.mode as 'nosplit' | 'split-by-uom' | 'split-by-weight' | 'mod',
    };

    let updatedConfigs;
    if (editingConfig) {
      updatedConfigs = lineSplitConfigs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
      toast({ title: 'Success', description: 'Line split configuration updated successfully' });
    } else {
      updatedConfigs = [...lineSplitConfigs, newConfig];
      toast({ title: 'Success', description: 'Line split configuration created successfully' });
    }

    // Update central store (this will trigger re-render with new data)
    saveFormChanges('lineSplit', updatedConfigs);

    form.reset();
    setIsFormVisible(false);
    setEditingConfig(null);
    setEditingConfigIndex(-1);
  };

  const handleEdit = (config: LineSplitConfig) => {
    const configIndex = lineSplitConfigs.findIndex(c => c.id === config.id);
    setEditingConfig(config);
    setEditingConfigIndex(configIndex);
    form.reset({
      storageIdentifiers: config.storageIdentifiers,
      lineIdentifiers: config.lineIdentifiers,
      sequence: config.sequence,
      mode: config.mode,
      allowedUOMs: config.allowedUOMs,
    });
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    const updatedConfigs = lineSplitConfigs.filter(config => config.id !== id);
    // Update central store (this will trigger re-render with new data)
    saveFormChanges('lineSplit', updatedConfigs);
    toast({ title: 'Success', description: 'Line split configuration deleted successfully' });
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleSaveFormChanges = () => {
    saveFormChanges('lineSplit', lineSplitConfigs);
    toast({ 
      title: 'Form Changes Saved', 
      description: `${lineSplitConfigs.length} line split configurations saved to central store.`,
    });
  };


  const getDisplayText = (config: LineSplitConfig) => {
    const storageText = Object.entries(config.storageIdentifiers)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'No storage filters';
    
    const lineText = Object.entries(config.lineIdentifiers)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'No line filters';

    return { storageText, lineText };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Line Split Configuration</h1>
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
              onClick={() => {
                setIsFormVisible(true);
                setEditingConfig(null);
                setEditingConfigIndex(-1);
                form.reset();
              }}
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
                <strong>Line Split Configuration</strong> determines how outbound lines are split based on storage and line identifiers. 
                Configure the splitting mode and allowed UOM levels for different product categories.
              </div>
              {(fetchedConfigs.data.lineSplit.length > 0 || fetchedConfigs.fetchedAt) && (
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
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Line Split Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Identifiers */}
                  <IdentifierFieldset 
                    control={form.control}
                    showLocationIdentifiers={false}
                    title="Identifiers"
                    configType="lineSplit"
                    configIndex={editingConfigIndex >= 0 ? editingConfigIndex : 0}
                  />

                  <Separator />

                  {/* Configuration Fields */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="sequence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Sequence</span>
                              <FieldStatusIndicator 
                                fieldPath={`lineSplit.${editingConfigIndex >= 0 ? editingConfigIndex : 'new'}.sequence`}
                                className="ml-1"
                                currentValue={form.watch('sequence')}
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

                      <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Split Mode</span>
                              <FieldStatusIndicator 
                                fieldPath={`lineSplit.${editingConfigIndex >= 0 ? editingConfigIndex : 'new'}.mode`}
                                className="ml-1"
                                currentValue={form.watch('mode')}
                              />
                            </FormLabel>
                            <FormControl>
                              <EnhancedSelect
                                value={field.value}
                                onValueChange={field.onChange}
                                options={formOptions.modes.lineSplit.map(mode => ({
                                  value: mode,
                                  label: mode.replace('-', ' ').toUpperCase()
                                }))}
                                placeholder="Select mode"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowedUOMs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Allowed UOMs</span>
                              <FieldStatusIndicator 
                                fieldPath={`lineSplit.${editingConfigIndex >= 0 ? editingConfigIndex : 'new'}.allowedUOMs`}
                                className="ml-1"
                                currentValue={form.watch('allowedUOMs')}
                              />
                            </FormLabel>
                            <FormControl>
                              <MultiSelectUOMs
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
        {lineSplitConfigs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Line Split Configurations ({lineSplitConfigs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Storage Identifiers</TableHead>
                    <TableHead>Line Identifiers</TableHead>
                    <TableHead>Allowed UOMs</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineSplitConfigs
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((config) => {
                      const { storageText, lineText } = getDisplayText(config);
                      return (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.sequence}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {config.mode.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm">{storageText}</span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm">{lineText}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {config.allowedUOMs.map((uom: string) => (
                                <Badge key={uom} variant="outline" className="text-xs">
                                  {uom}
                                </Badge>
                              ))}
                            </div>
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
              <div className="w-12 h-12 text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Line Split Configurations</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first line split configuration or load from fetched warehouse data.
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    setIsFormVisible(true);
                    setEditingConfig(null);
                    setEditingConfigIndex(-1);
                    form.reset();
                  }}
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