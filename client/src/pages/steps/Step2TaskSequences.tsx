import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit, Trash2, Info, CheckCircle, AlertTriangle, Package, ExternalLink } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { taskSequenceOptions, shipmentAcknowledgmentOptions } from '@/lib/mockData';
import type { InventoryGroup, TaskSequenceConfiguration, InsertTaskSequenceConfiguration } from '../../../../shared/schema';

const configurationSchema = z.object({
  id: z.number().optional(),
  inventoryGroupId: z.number().min(1, 'Please select an inventory group'),
  taskSequences: z.array(z.string()).min(1, 'Please select at least one task sequence'),
  shipmentAcknowledgment: z.string().min(1, 'Please select shipment acknowledgment')
});

type Configuration = z.infer<typeof configurationSchema>;

export default function Step2TaskSequences() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [isAddingConfig, setIsAddingConfig] = useState(false);

  const form = useForm<Configuration>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      inventoryGroupId: 0,
      taskSequences: [],
      shipmentAcknowledgment: ''
    }
  });

  const { data: configurations = [], isLoading } = useQuery<TaskSequenceConfiguration[]>({
    queryKey: ['/api/task-sequences'],
  });

  const { data: inventoryGroups = [] } = useQuery<InventoryGroup[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const saveConfigurationMutation = useMutation({
    mutationFn: async (data: Configuration) => {
      const payload: InsertTaskSequenceConfiguration = {
        userId: 1, // Mock user ID
        inventoryGroupId: data.inventoryGroupId,
        taskSequences: data.taskSequences,
        shipmentAcknowledgment: data.shipmentAcknowledgment
      };

      if (data.id) {
        const response = await apiRequest('PUT', `/api/task-sequences/${data.id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/task-sequences', payload);
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
      toast({ 
        title: "Error", 
        description: "Failed to save configuration",
        variant: "destructive" 
      });
    }
  });

  const deleteConfigurationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/task-sequences/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-sequences'] });
      toast({ title: "Configuration deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete configuration",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: Configuration) => {
    saveConfigurationMutation.mutate(data);
  };

  const handleEdit = (config: TaskSequenceConfiguration) => {
    const editData: Configuration = {
      id: config.id,
      inventoryGroupId: config.inventoryGroupId,
      taskSequences: config.taskSequences || [],
      shipmentAcknowledgment: config.shipmentAcknowledgment || ''
    };
    setEditingConfig(editData);
    form.reset(editData);
    setIsAddingConfig(true);
  };

  const handleDelete = (id: number) => {
    deleteConfigurationMutation.mutate(id);
  };

  const handleNext = () => {
    if (configurations.length === 0) {
      toast({
        title: "No configurations",
        description: "Please create at least one task sequence configuration before proceeding.",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'COMPLETE_STEP', payload: 2 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
  };

  const getInventoryGroupName = (inventoryGroupId: number) => {
    const group = inventoryGroups.find(g => g.id === inventoryGroupId);
    return group ? group.name : `Group ${inventoryGroupId}`;
  };

  const getInventoryGroupDetails = (inventoryGroupId: number) => {
    const group = inventoryGroups.find(g => g.id === inventoryGroupId);
    return group;
  };

  const handleCreateInventoryGroup = () => {
    setLocation('/step1');
  };

  return (
    <WizardLayout
      title="Task Sequences"
      description="Configure task sequences for your inventory groups. Task sequences define the order of operations (REPLEN → PICK → LOAD) for warehouse tasks."
      currentStep={2}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Continue to Pick Strategies"
      previousLabel="Back to Inventory Groups"
      isNextDisabled={configurations.length === 0}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-black" />
            <h3 className="text-lg font-medium">Task Sequence Configurations ({configurations.length})</h3>
          </div>
          <Button 
            onClick={() => setIsAddingConfig(true)}
            disabled={isAddingConfig || inventoryGroups.length === 0}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Configuration
          </Button>
        </div>

        {/* No Inventory Groups Warning */}
        {inventoryGroups.length === 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>No Inventory Groups Found:</strong> You need to create inventory groups first before configuring task sequences.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto text-orange-800 underline"
                onClick={handleCreateInventoryGroup}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Create Inventory Groups
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Information Alert */}
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Task Sequences:</strong> Define the workflow for each inventory group. Common sequences include OUTBOUND_REPLEN (move stock to pick locations), OUTBOUND_PICK (pick items), and OUTBOUND_LOAD (prepare for shipping).
          </AlertDescription>
        </Alert>

        {/* Create/Edit Form */}
        {isAddingConfig && inventoryGroups.length > 0 && (
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Task Sequence Configuration</CardTitle>
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
                          value={field.value ? field.value.toString() : ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an inventory group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryGroups.map((group) => {
                              const storageIds = group.storageIdentifiers as any;
                              const lineIds = group.lineIdentifiers as any;
                              return (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  <div className="flex items-center space-x-2">
                                    <span>{group.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {storageIds?.category || 'N/A'} | {storageIds?.uom || 'N/A'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {lineIds?.channel || 'N/A'} | {lineIds?.customer || 'N/A'}
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

                  {/* Task Sequences Selection */}
                  <FormField
                    control={form.control}
                    name="taskSequences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Sequences *</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {taskSequenceOptions.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={option}
                                checked={field.value.includes(option)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, option]);
                                  } else {
                                    field.onChange(field.value.filter((val) => val !== option));
                                  }
                                }}
                              />
                              <label
                                htmlFor={option}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Shipment Acknowledgment */}
                  <FormField
                    control={form.control}
                    name="shipmentAcknowledgment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipment Acknowledgment *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select acknowledgment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shipmentAcknowledgmentOptions.map((option) => (
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

                  <div className="flex justify-end space-x-2">
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
                    <Button 
                      type="submit" 
                      disabled={saveConfigurationMutation.isPending}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {saveConfigurationMutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Existing Configurations */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : configurations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Existing Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inventory Group</TableHead>
                    <TableHead>SI / LI</TableHead>
                    <TableHead>Task Sequences</TableHead>
                    <TableHead>Shipment Acknowledgment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => {
                    const inventoryGroup = getInventoryGroupDetails(config.inventoryGroupId);
                    return (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">
                          {getInventoryGroupName(config.inventoryGroupId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {inventoryGroup && (
                              <>
                                <Badge variant="secondary" className="text-xs">
                                  {(inventoryGroup.storageIdentifiers as any)?.category || 'N/A'} | {(inventoryGroup.storageIdentifiers as any)?.uom || 'N/A'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {(inventoryGroup.lineIdentifiers as any)?.channel || 'N/A'} | {(inventoryGroup.lineIdentifiers as any)?.customer || 'N/A'}
                                </Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {config.taskSequences?.map((task, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {task}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {config.shipmentAcknowledgment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(config)}
                              disabled={isAddingConfig}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(config.id)}
                              disabled={deleteConfigurationMutation.isPending}
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
        ) : inventoryGroups.length > 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Sequence Configurations</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first task sequence configuration by selecting an inventory group and defining the workflow steps.
              </p>
              <Button 
                onClick={() => setIsAddingConfig(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Configuration
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </WizardLayout>
  );
}