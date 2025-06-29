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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InventoryGroup, PickStrategyConfiguration, InsertPickStrategyConfiguration } from '../../../../shared/schema';

const pickStrategySchema = z.object({
  inventoryGroupId: z.number().min(1, "Inventory group is required"),
  taskKind: z.string().min(1, "Task kind is required"),
  taskSubKind: z.string().min(1, "Task sub kind is required"),
  strat: z.string().min(1, "Strategy is required"),
  sortingStrategy: z.string().min(1, "Sorting strategy is required"),
  loadingStrategy: z.string().min(1, "Loading strategy is required"),
  groupBy: z.array(z.string()),
  taskLabel: z.string().min(1, "Task label is required")
});

type PickStrategyForm = z.infer<typeof pickStrategySchema>;

export default function Step3PickStrategies() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingStrategy, setEditingStrategy] = useState<PickStrategyConfiguration | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: inventoryGroups = [] } = useQuery<InventoryGroup[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const { data: strategies = [] } = useQuery<PickStrategyConfiguration[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const form = useForm<PickStrategyForm>({
    resolver: zodResolver(pickStrategySchema),
    defaultValues: {
      inventoryGroupId: 0,
      taskKind: '',
      taskSubKind: '',
      strat: '',
      sortingStrategy: '',
      loadingStrategy: '',
      groupBy: [],
      taskLabel: ''
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertPickStrategyConfiguration) => {
      const response = await apiRequest('POST', '/api/pick-strategies', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      toast({ title: "Success", description: "Pick strategy saved successfully" });
      form.reset();
      setIsFormVisible(false);
      setEditingStrategy(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save pick strategy",
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertPickStrategyConfiguration }) => {
      const response = await apiRequest('PUT', `/api/pick-strategies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      toast({ title: "Success", description: "Pick strategy updated successfully" });
      form.reset();
      setIsFormVisible(false);
      setEditingStrategy(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update pick strategy",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/pick-strategies/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      toast({ title: "Success", description: "Pick strategy deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete pick strategy",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: PickStrategyForm) => {
    const payload: InsertPickStrategyConfiguration = {
      userId: 1,
      inventoryGroupId: data.inventoryGroupId,
      taskKind: data.taskKind,
      taskSubKind: data.taskSubKind,
      strat: data.strat,
      sortingStrategy: data.sortingStrategy,
      loadingStrategy: data.loadingStrategy,
      groupBy: data.groupBy,
      taskLabel: data.taskLabel
    };

    if (editingStrategy) {
      updateMutation.mutate({ id: editingStrategy.id, data: payload });
    } else {
      saveMutation.mutate(payload);
    }
  };

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    setLocation('/step4');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2');
  };

  const getInventoryGroupName = (id: number) => {
    const group = inventoryGroups.find(g => g.id === id);
    return group?.name || 'Unknown';
  };

  const getInventoryGroupDisplay = (id: number) => {
    const group = inventoryGroups.find(g => g.id === id);
    if (!group) return { storage: 'N/A', line: 'N/A' };
    
    const storageIds = group.storageIdentifiers as any;
    const lineIds = group.lineIdentifiers as any;
    
    return {
      storage: `${storageIds?.category || 'N/A'} | ${storageIds?.uom || 'N/A'}`,
      line: `${lineIds?.channel || 'N/A'} | ${lineIds?.customer || 'N/A'}`
    };
  };

  const handleEdit = (strategy: PickStrategyConfiguration) => {
    setEditingStrategy(strategy);
    form.reset({
      inventoryGroupId: strategy.inventoryGroupId,
      taskKind: strategy.taskKind,
      taskSubKind: strategy.taskSubKind,
      strat: strategy.strat,
      sortingStrategy: strategy.sortingStrategy,
      loadingStrategy: strategy.loadingStrategy,
      groupBy: strategy.groupBy || [],
      taskLabel: strategy.taskLabel
    });
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    if (inventoryGroups.length === 0) {
      toast({
        title: "No Inventory Groups",
        description: "Please create inventory groups first before adding pick strategies.",
        variant: "destructive"
      });
      setLocation('/step1');
      return;
    }
    
    setEditingStrategy(null);
    form.reset();
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingStrategy(null);
    form.reset();
  };

  return (
    <WizardLayout
      title="Pick Strategies"
      description="Configure pick strategies for each inventory group to optimize warehouse picking operations."
      currentStep={3}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Continue to HU Formation"
      previousLabel="Back to Task Sequences"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium">Pick Strategies ({strategies.length})</h3>
          </div>
          <Button 
            onClick={handleAddNew}
            disabled={isFormVisible || inventoryGroups.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pick Strategy
          </Button>
        </div>

        {/* Information Alert */}
        {inventoryGroups.length === 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>No Inventory Groups Found.</strong> Please create inventory groups first before configuring pick strategies.
            </AlertDescription>
          </Alert>
        )}

        {/* Create/Edit Form */}
        {isFormVisible && inventoryGroups.length > 0 && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>{editingStrategy ? 'Edit' : 'Create'} Pick Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Inventory Group Selection */}
                  <FormField
                    control={form.control}
                    name="inventoryGroupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventory Group *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString() || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an inventory group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryGroups.map((group) => {
                              const display = getInventoryGroupDisplay(group.id);
                              return (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <span>{group.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {typeof display === 'object' ? display.storage : 'N/A'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {typeof display === 'object' ? display.line : 'N/A'}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Strategy Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="taskKind"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Kind *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select task kind" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="OUTBOUND">OUTBOUND</SelectItem>
                              <SelectItem value="INBOUND">INBOUND</SelectItem>
                              <SelectItem value="TRANSFER">TRANSFER</SelectItem>
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
                          <FormLabel>Task Sub Kind *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub kind" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PICK">PICK</SelectItem>
                              <SelectItem value="REPLEN">REPLEN</SelectItem>
                              <SelectItem value="LOAD">LOAD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="strat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strategy *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FIFO">FIFO</SelectItem>
                              <SelectItem value="LIFO">LIFO</SelectItem>
                              <SelectItem value="FEFO">FEFO</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taskLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Label *</FormLabel>
                          <FormControl>
                            <input 
                              {...field} 
                              placeholder="Enter task label"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saveMutation.isPending || updateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saveMutation.isPending || updateMutation.isPending 
                        ? 'Saving...' 
                        : editingStrategy ? 'Update Strategy' : 'Create Strategy'
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Existing Strategies List */}
        {strategies.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Configured Pick Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inventory Group</TableHead>
                    <TableHead>Task Kind</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Task Label</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="font-medium">
                        {getInventoryGroupName(strategy.inventoryGroupId)}
                      </TableCell>
                      <TableCell>{strategy.taskKind}</TableCell>
                      <TableCell>{strategy.strat}</TableCell>
                      <TableCell>{strategy.taskLabel}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(strategy)}
                            disabled={isFormVisible}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(strategy.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : inventoryGroups.length > 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pick Strategies</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first pick strategy by selecting an inventory group and configuring the strategy parameters.
              </p>
              <Button 
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Pick Strategy
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </WizardLayout>
  );
}