import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download, RefreshCw, Trash2, Edit, AlertCircle, GripVertical, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import IdentifierFieldset from './components/IdentifierFieldset';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { TaskSequenceFormData, TaskSequenceConfig } from '@/types/outbound-v05';
import { useV05FormOptions } from '@/hooks/useV05FormOptions';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { FieldStatusIndicator, FieldStatusLegend } from '@/components/FieldStatusIndicator';

// Task pill component for drag-and-drop
function TaskPill({ 
  task, 
  onRemove,
  isDragging = false 
}: { 
  task: { taskKind: string; taskSubKind: string }, 
  onRemove: () => void,
  isDragging?: boolean 
}) {
  return (
    <div className={`flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 ${isDragging ? 'opacity-50' : ''}`}>
      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-blue-900">{task.taskKind}</div>
        {task.taskSubKind && (
          <div className="text-xs text-blue-700">{task.taskSubKind}</div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="w-6 h-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Task sequence editor with drag-and-drop
function TaskSequenceEditor({ 
  value, 
  onChange 
}: { 
  value: Array<{ taskKind: string; taskSubKind: string }>, 
  onChange: (value: Array<{ taskKind: string; taskSubKind: string }>) => void 
}) {
  const formOptions = useV05FormOptions();
  const [newTaskKind, setNewTaskKind] = useState('');
  const [newTaskSubKind, setNewTaskSubKind] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addTask = () => {
    if (newTaskKind) {
      onChange([...value, { taskKind: newTaskKind, taskSubKind: newTaskSubKind }]);
      setNewTaskKind('');
      setNewTaskSubKind('');
    }
  };

  const removeTask = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const moveTask = (fromIndex: number, toIndex: number) => {
    const newSequence = [...value];
    const [movedTask] = newSequence.splice(fromIndex, 1);
    newSequence.splice(toIndex, 0, movedTask);
    onChange(newSequence);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveTask(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Add new task */}
      <div className="border border-dashed border-gray-300 rounded-lg p-4">
        <h6 className="text-sm font-medium text-gray-700 mb-3">Add Task to Sequence</h6>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={newTaskKind} onValueChange={setNewTaskKind}>
            <SelectTrigger>
              <SelectValue placeholder="Select task kind" />
            </SelectTrigger>
            <SelectContent className="z-[9999] relative">
              {formOptions.taskKinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Task sub-kind (optional)"
            value={newTaskSubKind}
            onChange={(e) => setNewTaskSubKind(e.target.value)}
          />
          <Button onClick={addTask} disabled={!newTaskKind} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task sequence list */}
      {value.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h6 className="text-sm font-medium text-gray-700">Task Sequence ({value.length} tasks)</h6>
            <div className="text-xs text-gray-500">Drag to reorder</div>
          </div>
          {value.map((task, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="cursor-move"
            >
              <TaskPill
                task={task}
                onRemove={() => removeTask(index)}
                isDragging={draggedIndex === index}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No tasks in sequence</div>
          <div className="text-xs mt-1">Add tasks above to build your sequence</div>
        </div>
      )}
    </div>
  );
}

const taskSequenceSchema = z.object({
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
  taskSequence: z.array(z.object({
    taskKind: z.string(),
    taskSubKind: z.string(),
  })).min(1, 'At least one task must be in the sequence'),
  ginAckByApi: z.boolean(),
  ginAckLevel: z.string(),
  grnTriggerTask: z.string(),
});

export default function TaskSequenceV05() {
  const { state } = useWizard();
  const { toast } = useToast();
  const formOptions = useV05FormOptions();
  const [taskSequenceConfigs, setTaskSequenceConfigs] = useState<TaskSequenceConfig[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaskSequenceConfig | null>(null);
  const fetchedConfigs = useFetchedConfigurations();
  const { configuration, saveFormChanges, hasUnsavedChanges } = useConfiguration();

  const form = useForm<TaskSequenceFormData>({
    resolver: zodResolver(taskSequenceSchema),
    defaultValues: {
      storageIdentifiers: {},
      lineIdentifiers: {},
      sequence: 0,
      taskSequence: [],
      ginAckByApi: false,
      ginAckLevel: 'LINE',
      grnTriggerTask: 'OUTBOUND_PICK',
    }
  });

  // Load configurations from central store and sync changes
  useEffect(() => {
    setTaskSequenceConfigs(configuration.taskSequences);
  }, [configuration.taskSequences]);



  // Function removed - auto-population handles this now

  const onSubmit = (data: TaskSequenceFormData) => {
    const newConfig: TaskSequenceConfig = {
      id: editingConfig?.id || crypto.randomUUID(),
      whId: state.warehouseCode ? parseInt(state.warehouseCode) : undefined,
      ...data,
    };

    let updatedConfigs;
    if (editingConfig) {
      updatedConfigs = taskSequenceConfigs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
      toast({ title: 'Success', description: 'Task sequence configuration updated successfully' });
    } else {
      updatedConfigs = [...taskSequenceConfigs, newConfig];
      toast({ title: 'Success', description: 'Task sequence configuration created successfully' });
    }

    // Update local state AND central store immediately
    setTaskSequenceConfigs(updatedConfigs);
    saveFormChanges('taskSequences', updatedConfigs);

    form.reset();
    setIsFormVisible(false);
    setEditingConfig(null);
  };

  const handleEdit = (config: TaskSequenceConfig) => {
    setEditingConfig(config);
    form.reset({
      storageIdentifiers: config.storageIdentifiers,
      lineIdentifiers: config.lineIdentifiers,
      sequence: config.sequence,
      taskSequence: config.taskSequence,
      ginAckByApi: config.ginAckByApi || false,
      ginAckLevel: config.ginAckLevel || 'LINE',
      grnTriggerTask: config.grnTriggerTask || 'OUTBOUND_PICK',
    });
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    const updatedConfigs = taskSequenceConfigs.filter(config => config.id !== id);
    // Update local state AND central store immediately
    setTaskSequenceConfigs(updatedConfigs);
    saveFormChanges('taskSequences', updatedConfigs);
    toast({ title: 'Success', description: 'Task sequence configuration deleted successfully' });
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingConfig(null);
    form.reset();
  };

  const handleSaveFormChanges = () => {
    saveFormChanges('taskSequences', taskSequenceConfigs);
    toast({ 
      title: 'Form Changes Saved', 
      description: `${taskSequenceConfigs.length} task sequence configurations saved to central store.`,
    });
  };

  const getDisplayText = (config: TaskSequenceConfig) => {
    const storageText = Object.entries(config.storageIdentifiers)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'No storage filters';
    
    const lineText = Object.entries(config.lineIdentifiers)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') || 'No line filters';

    const taskText = config.taskSequence
      .map(task => task.taskKind + (task.taskSubKind ? ` (${task.taskSubKind})` : ''))
      .join(' → ');

    return { storageText, lineText, taskText };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-900">Task Sequence Configuration</h1>
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
                <strong>Task Sequence Configuration</strong> defines the order of tasks that should be executed for outbound operations. 
                Configure task sequences with GRN trigger settings and API acknowledgment options.
              </div>
              {(fetchedConfigs.data.taskSequences.length > 0 || fetchedConfigs.fetchedAt) && (
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
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Task Sequence Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Identifiers */}
                  <IdentifierFieldset 
                    control={form.control}
                    showLocationIdentifiers={false}
                    title="Identifiers"
                    configType="taskSequences"
                    configIndex={0}
                  />

                  <Separator />

                  {/* Configuration Fields */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Sequence Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <FormField
                        control={form.control}
                        name="sequence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>Sequence</span>
                              <FieldStatusIndicator 
                                fieldPath="taskSequences.0.sequence"
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
                    </div>

                    {/* Task Sequence Editor */}
                    <FormField
                      control={form.control}
                      name="taskSequence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <span>Task Sequence</span>
                            <FieldStatusIndicator 
                              fieldPath="taskSequences.0.taskSequence"
                              className="ml-1"
                              currentValue={form.watch('taskSequence')}
                            />
                          </FormLabel>
                          <FormControl>
                            <TaskSequenceEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* GRN Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">GRN Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="ginAckByApi"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center space-x-2">
                              <span>API Acknowledgment</span>
                              <FieldStatusIndicator 
                                fieldPath="taskSequences.0.ginAckByApi"
                                className="ml-1"
                                currentValue={form.watch('ginAckByApi')}
                              />
                            </FormLabel>
                              <div className="text-sm text-gray-600">
                                Enable GIN acknowledgment via API
                              </div>
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
                        name="ginAckLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>GIN Ack Level</span>
                              <FieldStatusIndicator 
                                fieldPath="taskSequences.0.ginAckLevel"
                                className="ml-1"
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {formOptions.ginAckLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {level}
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
                        name="grnTriggerTask"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <span>GRN Trigger Task</span>
                              <FieldStatusIndicator 
                                fieldPath="taskSequences.0.grnTriggerTask"
                                className="ml-1"
                              />
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select task" />
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
        {taskSequenceConfigs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Task Sequence Configurations ({taskSequenceConfigs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Task Flow</TableHead>
                    <TableHead>Storage Identifiers</TableHead>
                    <TableHead>Line Identifiers</TableHead>
                    <TableHead>GRN Settings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskSequenceConfigs
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((config) => {
                      const { storageText, lineText, taskText } = getDisplayText(config);
                      return (
                        <TableRow key={config.id}>
                          <TableCell className="font-medium">{config.sequence}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm font-mono text-blue-900 truncate" title={taskText}>
                              {taskText || 'No tasks'}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm">{storageText}</span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            <span className="text-sm">{lineText}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant={config.ginAckByApi ? 'default' : 'secondary'} className="text-xs">
                                  API: {config.ginAckByApi ? 'ON' : 'OFF'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {config.ginAckLevel}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600">
                                Trigger: {config.grnTriggerTask?.replace('_', ' ')}
                              </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Sequence Configurations</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first task sequence configuration or load from fetched warehouse data.
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