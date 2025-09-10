import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Edit, Trash2, Info, CheckCircle, AlertTriangle, Package, ExternalLink, GripVertical } from 'lucide-react';

import WizardContent from '@/components/WizardContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TaskSequenceVisualization } from '@/components/TaskSequenceVisualization';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { taskSequenceOptions, shipmentAcknowledgmentOptions } from '@/lib/mockData';
import type { InventoryGroup, TaskSequenceConfiguration, InsertTaskSequenceConfiguration } from '../../../../shared/schema';

const taskSequenceSchema = z.object({
  taskKind: z.string().min(1, 'Task kind is required'),
  taskSubKind: z.string().optional()
});

const configurationSchema = z.object({
  id: z.number().optional(),
  inventoryGroupId: z.number().optional(),
  taskSequences: z.array(z.string()).optional(),
  shipmentAcknowledgment: z.string().optional()
});

type Configuration = z.infer<typeof configurationSchema>;
type TaskSequenceInput = z.infer<typeof taskSequenceSchema>;

export default function Step3TaskSequences() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [selectedMaterialGroup, setSelectedMaterialGroup] = useState<number | null>(null);
  const [taskSequenceList, setTaskSequenceList] = useState<string[]>([]);

  const form = useForm<Configuration>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      inventoryGroupId: 0,
      taskSequences: [],
      shipmentAcknowledgment: ''
    }
  });

  const taskForm = useForm<TaskSequenceInput>({
    resolver: zodResolver(taskSequenceSchema),
    defaultValues: {
      taskKind: '',
      taskSubKind: ''
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

  // Task sequence handlers
  const onAddTask = (data: TaskSequenceInput) => {
    const newTask = data.taskSubKind ? `${data.taskKind}_${data.taskSubKind}` : data.taskKind;
    setTaskSequenceList(prev => [...prev, newTask]);
    taskForm.reset();
  };

  const removeTask = (index: number) => {
    setTaskSequenceList(prev => prev.filter((_, i) => i !== index));
  };

  const moveTask = (fromIndex: number, toIndex: number) => {
    setTaskSequenceList(prev => {
      const newList = [...prev];
      const [movedItem] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, movedItem);
      return newList;
    });
  };

  return (
    <WizardContent
      title="Task Sequences"
      description="Configure task sequences for your material groups. Task sequences define the order of operations (REPLEN → PICK → LOAD) for warehouse tasks."
      currentStep={2}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Continue to Pick Strategies"
      previousLabel="Back to Material Groups"
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
              <strong>No Material Groups Found:</strong> You need to create material groups first before configuring task sequences.
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto text-orange-800 underline"
                onClick={handleCreateInventoryGroup}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Create Material Groups
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Information Alert */}
        <Alert className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>Task Sequences:</strong> Define the workflow for each material group. Common sequences include OUTBOUND_REPLEN (move stock to pick locations), OUTBOUND_PICK (pick items), and OUTBOUND_LOAD (prepare for shipping).
          </AlertDescription>
        </Alert>

        {/* Tabs for Configuration and Visualization */}
        <Tabs defaultValue="configuration" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6">
            {/* Material Group Selection Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <CardTitle>Task Sequence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Material Group Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Material Group</label>
                  <Select 
                    value={selectedMaterialGroup?.toString() || ''} 
                    onValueChange={(value) => {
                      setSelectedMaterialGroup(parseInt(value));
                      setTaskSequenceList([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a material group" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMaterialGroup && (
                  <>
                    {/* Add Task Section */}
                    <div>
                      <h3 className="text-base font-medium mb-4">Add Task to Sequence</h3>
                      
                      <Form {...taskForm}>
                        <form onSubmit={taskForm.handleSubmit(onAddTask)} className="flex gap-4 items-end">
                          <FormField
                            control={taskForm.control}
                            name="taskKind"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select task kind" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {taskSequenceOptions.map((option) => (
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
                            control={taskForm.control}
                            name="taskSubKind"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Task sub-kind (optional)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                          </Button>
                        </form>
                      </Form>
                    </div>

                    {/* Task Sequence List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-medium">Task Sequence ({taskSequenceList.length} tasks)</h3>
                        {taskSequenceList.length > 1 && (
                          <span className="text-sm text-gray-500">Drag to reorder</span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {taskSequenceList.map((task, index) => (
                          <div key={index} className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <GripVertical className="w-4 h-4 text-gray-400 mr-3 cursor-move" />
                            <span className="font-medium text-blue-900 flex-1">{task}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(index)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {taskSequenceList.length === 0 && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No tasks added yet. Add your first task above.</p>
                        </div>
                      )}
                    </div>

                    {/* Save Configuration */}
                    {taskSequenceList.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit((data) => {
                            const configData: Configuration = {
                              ...data,
                              id: editingConfig?.id,
                              inventoryGroupId: selectedMaterialGroup!,
                              taskSequences: taskSequenceList
                            };
                            saveConfigurationMutation.mutate(configData);
                            
                            // Reset state after save
                            setSelectedMaterialGroup(null);
                            setTaskSequenceList([]);
                            setEditingConfig(null);
                          })} className="space-y-4">
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
                            <Button 
                              type="submit" 
                              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                              disabled={saveConfigurationMutation.isPending}
                            >
                              {saveConfigurationMutation.isPending ? 'Saving Configuration...' : 'Save Task Sequence Configuration'}
                            </Button>
                          </form>
                        </Form>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* No Material Groups Warning */}
            {inventoryGroups.length === 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>No Material Groups Found:</strong> You need to create material groups first before configuring task sequences.
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto text-orange-800 underline"
                    onClick={handleCreateInventoryGroup}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Create Material Groups
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Existing Configurations */}
            {configurations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Existing Configurations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material Group</TableHead>
                        <TableHead>Task Sequences</TableHead>
                        <TableHead>Shipment Acknowledgment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {configurations.map((config) => (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">
                            {getInventoryGroupName(config.inventoryGroupId)}
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
                                onClick={() => {
                                  setSelectedMaterialGroup(config.inventoryGroupId);
                                  setTaskSequenceList(config.taskSequences || []);
                                  form.setValue('shipmentAcknowledgment', config.shipmentAcknowledgment || '');
                                  setEditingConfig({
                                    id: config.id,
                                    inventoryGroupId: config.inventoryGroupId,
                                    taskSequences: config.taskSequences || [],
                                    shipmentAcknowledgment: config.shipmentAcknowledgment || ''
                                  });
                                }}
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
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Task Sequence Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskSequenceVisualization 
                  materialGroups={inventoryGroups}
                  taskSequenceConfigs={configurations}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WizardContent>
  );
}