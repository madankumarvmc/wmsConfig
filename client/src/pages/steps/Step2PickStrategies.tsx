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
  taskKinds,
  taskSubKinds,
  pickStrategies,
  specificSortingStrategies,
  specificLoadingStrategies,
  groupByOptions
} from '@/lib/mockData';

const pickStrategySchema = z.object({
  id: z.number().optional(),
  taskKind: z.string().min(1, "Task kind is required"),
  taskSubKind: z.string().min(1, "Task sub kind is required"),
  storageIdentifiers: z.object({
    category: z.string().min(1, "Category is required"),
    skuClassType: z.string().min(1, "SKU class type is required"),
    skuClass: z.string().min(1, "SKU class is required"),
    uom: z.string().min(1, "UOM is required"),
    bucket: z.string().min(1, "Bucket is required"),
    specialStorage: z.boolean()
  }),
  lineIdentifiers: z.object({
    channel: z.string().min(1, "Channel is required"),
    customer: z.string().min(1, "Customer is required")
  }),
  taskAttrs: z.object({}).optional(),
  strat: z.string().min(1, "Strategy is required"),
  sortingStrategy: z.string().min(1, "Sorting strategy is required"),
  loadingStrategy: z.string().min(1, "Loading strategy is required"),
  groupBy: z.array(z.string()),
  taskLabel: z.string().min(1, "Task label is required")
});

type PickStrategy = z.infer<typeof pickStrategySchema>;

export default function Step2PickStrategies() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingStrategy, setEditingStrategy] = useState<PickStrategy | null>(null);
  const [isAddingStrategy, setIsAddingStrategy] = useState(false);

  const form = useForm<PickStrategy>({
    resolver: zodResolver(pickStrategySchema),
    defaultValues: {
      taskKind: '',
      taskSubKind: '',
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
      taskAttrs: {},
      strat: '',
      sortingStrategy: '',
      loadingStrategy: '',
      groupBy: [],
      taskLabel: ''
    }
  });

  const { data: strategies = [] } = useQuery<PickStrategy[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const saveStrategyMutation = useMutation({
    mutationFn: async (data: PickStrategy) => {
      if (data.id) {
        const response = await apiRequest('PUT', `/api/pick-strategies/${data.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/pick-strategies', data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      toast({ title: "Pick strategy saved successfully" });
      setIsAddingStrategy(false);
      setEditingStrategy(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to save pick strategy", variant: "destructive" });
    }
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/pick-strategies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      toast({ title: "Pick strategy deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete pick strategy", variant: "destructive" });
    }
  });

  const onSubmit = (data: PickStrategy) => {
    saveStrategyMutation.mutate(data);
  };

  const handleEdit = (strategy: PickStrategy) => {
    setEditingStrategy(strategy);
    form.reset(strategy);
    setIsAddingStrategy(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this pick strategy?')) {
      deleteStrategyMutation.mutate(id);
    }
  };

  const addGroupBy = (option: string) => {
    const currentGroupBy = form.getValues('groupBy');
    if (!currentGroupBy.includes(option)) {
      form.setValue('groupBy', [...currentGroupBy, option]);
    }
  };

  const removeGroupBy = (option: string) => {
    const currentGroupBy = form.getValues('groupBy');
    form.setValue('groupBy', currentGroupBy.filter(g => g !== option));
  };

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 2 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
    setLocation('/step1');
  };

  const watchedGroupBy = form.watch('groupBy');

  return (
    <WizardLayout
      title="Pick Strategy Definition"
      description="Configure pick strategies for task kinds with Storage and Line Identifiers. Each strategy defines how items are picked, sorted, and loaded."
      currentStep={2}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: HU Formation"
      previousLabel="Previous: Task Sequences"
    >
      {/* Step Description */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Step 2: Pick Strategy Definition</strong> - Configure pick strategies for each task kind with independent Storage and Line Identifier combinations. Define how items are picked, sorted, and loaded for different scenarios.
        </AlertDescription>
      </Alert>

      {/* Pick Strategy Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pick Strategy Configuration</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Define strategies for task kinds with SI/LI combinations</p>
            </div>
            <Button
              onClick={() => setIsAddingStrategy(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pick Strategy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingStrategy && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Task Configuration</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="taskKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Task Kind</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select task kind" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {taskKinds.map(kind => (
                                  <SelectItem key={kind.value} value={kind.value}>{kind.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taskSubKind"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Task Sub Kind</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sub kind" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {taskSubKinds.map(subKind => (
                                  <SelectItem key={subKind.value} value={subKind.value}>{subKind.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taskLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Task Label</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter task label" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Storage & Line Identifiers */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Storage & Line Identifiers</h3>
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
                                  <SelectValue placeholder="Category" />
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
                                  <SelectValue placeholder="Type" />
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
                                  <SelectValue placeholder="Class" />
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
                                  <SelectValue placeholder="UOM" />
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
                                  <SelectValue placeholder="Bucket" />
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
                                  <SelectValue placeholder="Select customer" />
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
                  </div>

                  {/* Strategy Configuration */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Strategy Configuration</h3>
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="strat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pick Strategy</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select strategy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {pickStrategies.map(strategy => (
                                  <SelectItem key={strategy.value} value={strategy.value}>{strategy.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sortingStrategy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Sorting Strategy</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sorting" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specificSortingStrategies.map(strategy => (
                                  <SelectItem key={strategy.value} value={strategy.value}>{strategy.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="loadingStrategy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Loading Strategy</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select loading" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specificLoadingStrategies.map(strategy => (
                                  <SelectItem key={strategy.value} value={strategy.value}>{strategy.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      {/* Group By Options */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-900">Group By</h4>
                        <div className="flex flex-wrap gap-2">
                          {watchedGroupBy?.map((option) => (
                            <Badge key={option} variant="secondary" className="flex items-center">
                              {groupByOptions.find(g => g.value === option)?.label}
                              <button
                                type="button"
                                onClick={() => removeGroupBy(option)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={addGroupBy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add group by option" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupByOptions
                              .filter(option => !watchedGroupBy?.includes(option.value))
                              .map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingStrategy(false);
                      setEditingStrategy(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveStrategyMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {saveStrategyMutation.isPending ? 'Saving...' : (editingStrategy ? 'Update Strategy' : 'Save Strategy')}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Strategies List */}
          {strategies.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Configured Pick Strategies</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Storage ID</TableHead>
                      <TableHead>Line ID</TableHead>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Sorting</TableHead>
                      <TableHead>Loading</TableHead>
                      <TableHead>Group By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {strategies.map((strategy) => (
                      <TableRow key={strategy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{strategy.taskKind}</div>
                            <div className="text-sm text-gray-500">{strategy.taskSubKind}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{strategy.storageIdentifiers.category}</div>
                            <div className="text-gray-500">{strategy.storageIdentifiers.skuClass}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{strategy.lineIdentifiers.channel}</div>
                            <div className="text-gray-500">{strategy.lineIdentifiers.customer}</div>
                          </div>
                        </TableCell>
                        <TableCell>{strategy.strat}</TableCell>
                        <TableCell>{strategy.sortingStrategy}</TableCell>
                        <TableCell>{strategy.loadingStrategy}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {strategy.groupBy?.map((group) => (
                              <Badge key={group} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(strategy)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => strategy.id && handleDelete(strategy.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {strategies.length === 0 && !isAddingStrategy && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No pick strategies configured yet.</p>
              <p className="text-sm">Click "Add Pick Strategy" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </WizardLayout>
  );
}
