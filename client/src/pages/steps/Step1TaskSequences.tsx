import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit, Trash2, Info, CheckCircle, AlertTriangle } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  categories, 
  skuClassTypes, 
  skuClasses, 
  uoms, 
  buckets, 
  channels, 
  customers, 
  taskSequenceOptions,
  shipmentAcknowledgmentOptions 
} from '@/lib/mockData';

const configurationSchema = z.object({
  id: z.number().optional(),
  storageIdentifiers: z.object({
    category: z.string(),
    skuClassType: z.string(),
    skuClass: z.string(),
    uom: z.string(),
    bucket: z.string(),
    specialStorage: z.boolean()
  }),
  lineIdentifiers: z.object({
    channel: z.string(),
    customer: z.string()
  }),
  taskSequences: z.array(z.string()),
  shipmentAcknowledgment: z.string()
});

type Configuration = z.infer<typeof configurationSchema>;

export default function Step1TaskSequences() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [isAddingConfig, setIsAddingConfig] = useState(false);

  const form = useForm<Configuration>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      storageIdentifiers: {
        category: '',
        skuClassType: '',
        skuClass: '',
        uom: '',
        bucket: '',
        specialStorage: false
      },
      lineIdentifiers: {
        channel: '',
        customer: ''
      },
      taskSequences: [],
      shipmentAcknowledgment: ''
    }
  });

  const { data: configurations = [] } = useQuery({
    queryKey: ['/api/task-sequences'],
  });

  const saveConfigurationMutation = useMutation({
    mutationFn: async (data: Configuration) => {
      if (data.id) {
        const response = await apiRequest('PUT', `/api/task-sequences/${data.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/task-sequences', data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-sequences'] });
      toast({ title: "Configuration saved successfully" });
      setIsAddingConfig(false);
      setEditingConfig(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to save configuration", variant: "destructive" });
    }
  });

  const deleteConfigurationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/task-sequences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-sequences'] });
      toast({ title: "Configuration deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete configuration", variant: "destructive" });
    }
  });

  const onSubmit = (data: Configuration) => {
    saveConfigurationMutation.mutate(data);
  };

  const handleEdit = (config: Configuration) => {
    setEditingConfig(config);
    form.reset(config);
    setIsAddingConfig(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteConfigurationMutation.mutate(id);
    }
  };

  const addTaskSequence = (sequence: string) => {
    const currentSequences = form.getValues('taskSequences');
    if (!currentSequences.includes(sequence)) {
      form.setValue('taskSequences', [...currentSequences, sequence]);
    }
  };

  const removeTaskSequence = (sequence: string) => {
    const currentSequences = form.getValues('taskSequences');
    form.setValue('taskSequences', currentSequences.filter(s => s !== sequence));
  };

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2');
  };

  const watchedTaskSequences = form.watch('taskSequences');

  return (
    <WizardLayout
      title="Define Task Sequences"
      description="Configure Storage Identifiers (SI) and Line Identifiers (LI) combinations to define task sequences for your outbound operations."
      currentStep={1}
      totalSteps={6}
      onNext={handleNext}
      nextLabel="Next: Pick Strategies"
      isPreviousDisabled={true}
    >
      {/* Step Description */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Step 1: Define Task Sequences</strong> - Configure Storage Identifiers (SI) and Line Identifiers (LI) combinations to define task sequences for your outbound operations. Each combination will determine the workflow for specific inventory and order types.
        </AlertDescription>
      </Alert>

      {/* Configuration Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Storage & Line Identifier Matrix</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Create SI/LI combinations and assign task sequences</p>
            </div>
            <Button
              onClick={() => setIsAddingConfig(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingConfig && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Storage Identifiers */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Storage Identifiers (SI)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="storageIdentifiers.category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
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
                        control={form.control}
                        name="storageIdentifiers.skuClassType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">SKU Class Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
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
                      <FormField
                        control={form.control}
                        name="storageIdentifiers.skuClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">SKU Class</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {skuClasses.map(cls => (
                                  <SelectItem key={cls.value} value={cls.value}>{cls.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="storageIdentifiers.uom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">UOM</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select UOM" />
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
                        name="storageIdentifiers.bucket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Bucket</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bucket" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {buckets.map(bucket => (
                                  <SelectItem key={bucket.value} value={bucket.value}>{bucket.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="storageIdentifiers.specialStorage"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 pt-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Special Storage</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Line Identifiers */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Line Identifiers (LI)</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="lineIdentifiers.channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Channel</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {channels.map(channel => (
                                  <SelectItem key={channel.value} value={channel.value}>{channel.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lineIdentifiers.customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Customer</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Search customers..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers.map(customer => (
                                  <SelectItem key={customer.value} value={customer.value}>{customer.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Task Sequences */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Task Sequences</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchedTaskSequences?.map((sequence) => (
                          <Badge key={sequence} variant="secondary" className="bg-blue-100 text-blue-800">
                            {sequence}
                            <button
                              type="button"
                              onClick={() => removeTaskSequence(sequence)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addTaskSequence}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add task sequence" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskSequenceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Shipment Acknowledgment */}
                    <FormField
                      control={form.control}
                      name="shipmentAcknowledgment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Shipment Acknowledgment</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select acknowledgment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shipmentAcknowledgmentOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingConfig(false);
                      setEditingConfig(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveConfigurationMutation.isPending}>
                    {editingConfig ? 'Update' : 'Save'} Configuration
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Configuration Table */}
          {configurations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Storage Identifiers (SI)</TableHead>
                  <TableHead>Line Identifiers (LI)</TableHead>
                  <TableHead>Task Sequences</TableHead>
                  <TableHead>Shipment Acknowledgment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configurations.map((config: any) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div><strong>Category:</strong> {config.storageIdentifiers.category}</div>
                        <div><strong>SKU Class:</strong> {config.storageIdentifiers.skuClass}</div>
                        <div><strong>UOM:</strong> {config.storageIdentifiers.uom}</div>
                        {config.storageIdentifiers.specialStorage && (
                          <Badge variant="secondary" className="text-xs">Special Storage</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div><strong>Channel:</strong> {config.lineIdentifiers.channel}</div>
                        <div><strong>Customer:</strong> {config.lineIdentifiers.customer}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {config.taskSequences?.map((sequence: string) => (
                          <Badge key={sequence} variant="outline" className="text-xs">
                            {sequence}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {config.shipmentAcknowledgment}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(config.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No configurations created yet. Click "Add Configuration" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      {configurations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{configurations.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Configurations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {configurations.reduce((total: number, config: any) => total + (config.taskSequences?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Task Sequences Defined</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {new Set(configurations.map((config: any) => config.lineIdentifiers.channel)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Unique Channels</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Messages */}
      <div className="space-y-3">
        {configurations.length > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Configuration Valid</strong> - All SI/LI combinations have been properly configured with task sequences and acknowledgment triggers.
            </AlertDescription>
          </Alert>
        )}
        
        {configurations.length > 2 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <strong>Optimization Suggestion</strong> - Consider consolidating similar configurations to reduce complexity in later steps.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </WizardLayout>
  );
}
