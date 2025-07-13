import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Plus, Save, X } from 'lucide-react';

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
import type { TaskPlanningConfiguration, InsertTaskPlanningConfiguration } from '../../../shared/schema';

const taskPlanningSchema = z.object({
  taskKind: z.string().min(1, 'Task Kind is required'),
  taskSubKind: z.string().min(1, 'Task Sub Kind is required'),
  strat: z.string().min(1, 'Strategy is required'),
  sortingStrategy: z.string().min(1, 'Sorting Strategy is required'),
  loadingStrategy: z.string().min(1, 'Loading Strategy is required'),
  taskLabel: z.string().min(1, 'Task Label is required'),
  mode: z.string().min(1, 'Mode is required'),
  priority: z.number().min(0, 'Priority must be non-negative'),
  skipZoneFace: z.string().min(1, 'Skip Zone Face is required'),
  searchScope: z.string().min(1, 'Search Scope is required'),
  batchPreferenceMode: z.string().min(1, 'Batch Preference Mode is required'),
  optimizationMode: z.string().min(1, 'Optimization Mode is required'),
  orderByQuantUpdatedAt: z.boolean(),
  preferFixed: z.boolean(),
  preferNonFixed: z.boolean(),
  orderByPickingPosition: z.boolean(),
  useInventorySnapshotForPickSlotting: z.boolean(),
});

type TaskPlanningForm = z.infer<typeof taskPlanningSchema>;

interface TaskPlanningConfigProps {
  inventoryGroupId: number;
  inventoryGroupName: string;
}

const taskKindOptions = ['AUTO_REPLEN', 'MANUAL_REPLEN', 'OUTBOUND_PICK', 'INBOUND_PUT'];
const stratOptions = ['PICK_ALL_TRIPS', 'PICK_SINGLE_TRIP', 'OPTIMIZE_PICK_PATH'];
const sortingStrategyOptions = ['SORT_BY_INVOICE', 'SORT_BY_LOCATION', 'SORT_BY_PRIORITY'];
const loadingStrategyOptions = ['LOAD_BY_CUSTOMER', 'LOAD_BY_ROUTE', 'LOAD_BY_PRIORITY'];
const modeOptions = ['PICK', 'PUT', 'REPLEN'];
const skipZoneFaceOptions = ['PICK', 'PUT', 'NONE'];
const searchScopeOptions = ['WH', 'AREA', 'ZONE'];
const batchPreferenceModeOptions = ['CLOSEST_PREVIOUS', 'NEWEST', 'OLDEST', 'NONE'];
const optimizationModeOptions = ['TOUCH', 'DISTANCE', 'TIME'];

export default function TaskPlanningConfig({ inventoryGroupId, inventoryGroupName }: TaskPlanningConfigProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: configuration, isLoading } = useQuery<TaskPlanningConfiguration | null>({
    queryKey: ['/api/task-planning/by-group', inventoryGroupId],
  });

  const form = useForm<TaskPlanningForm>({
    resolver: zodResolver(taskPlanningSchema),
    defaultValues: {
      taskKind: configuration?.taskKind || 'AUTO_REPLEN',
      taskSubKind: configuration?.taskSubKind || '',
      strat: configuration?.strat || 'PICK_ALL_TRIPS',
      sortingStrategy: configuration?.sortingStrategy || 'SORT_BY_INVOICE',
      loadingStrategy: configuration?.loadingStrategy || 'LOAD_BY_CUSTOMER',
      taskLabel: configuration?.taskLabel || `${inventoryGroupName} Task Planning`,
      mode: configuration?.mode || 'PICK',
      priority: configuration?.priority || 0,
      skipZoneFace: configuration?.skipZoneFace || 'PICK',
      searchScope: configuration?.searchScope || 'WH',
      batchPreferenceMode: configuration?.batchPreferenceMode || 'CLOSEST_PREVIOUS',
      optimizationMode: configuration?.optimizationMode || 'TOUCH',
      orderByQuantUpdatedAt: configuration?.orderByQuantUpdatedAt || true,
      preferFixed: configuration?.preferFixed || true,
      preferNonFixed: configuration?.preferNonFixed || true,
      orderByPickingPosition: configuration?.orderByPickingPosition || true,
      useInventorySnapshotForPickSlotting: configuration?.useInventorySnapshotForPickSlotting || true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: TaskPlanningForm) => {
      const payload: InsertTaskPlanningConfiguration = {
        inventoryGroupId,
        ...data,
        taskAttrs: {},
        groupBy: ['category'],
        statePreferenceOrder: ['PURE'],
        statePreferenceSeq: ['PURE'],
        areaTypes: ['INVENTORY'],
        areas: [],
      };

      if (configuration) {
        return apiRequest(`/api/task-planning/${configuration.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        return apiRequest('/api/task-planning', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning/by-group', inventoryGroupId] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Task planning configuration saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save task planning configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskPlanningForm) => {
    saveMutation.mutate(data);
  };

  const handleEdit = () => {
    if (configuration) {
      form.reset({
        taskKind: configuration.taskKind,
        taskSubKind: configuration.taskSubKind,
        strat: configuration.strat,
        sortingStrategy: configuration.sortingStrategy,
        loadingStrategy: configuration.loadingStrategy,
        taskLabel: configuration.taskLabel,
        mode: configuration.mode,
        priority: configuration.priority,
        skipZoneFace: configuration.skipZoneFace,
        searchScope: configuration.searchScope,
        batchPreferenceMode: configuration.batchPreferenceMode,
        optimizationMode: configuration.optimizationMode,
        orderByQuantUpdatedAt: configuration.orderByQuantUpdatedAt,
        preferFixed: configuration.preferFixed,
        preferNonFixed: configuration.preferNonFixed,
        orderByPickingPosition: configuration.orderByPickingPosition,
        useInventorySnapshotForPickSlotting: configuration.useInventorySnapshotForPickSlotting,
      });
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Task Planning Configuration
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
            <Settings className="h-4 w-4" />
            Task Planning Configuration
          </CardTitle>
          {!isEditing && (
            <Button
              onClick={configuration ? handleEdit : () => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {configuration ? <Settings className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
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
                <span className="font-medium text-gray-600">Task Kind:</span>
                <div className="mt-1">{configuration.taskKind}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Strategy:</span>
                <div className="mt-1">{configuration.strat}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sorting:</span>
                <div className="mt-1">{configuration.sortingStrategy}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Loading:</span>
                <div className="mt-1">{configuration.loadingStrategy}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Mode:</span>
                <div className="mt-1">{configuration.mode}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Priority:</span>
                <div className="mt-1">{configuration.priority}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {configuration.preferFixed && <Badge variant="secondary">Prefer Fixed</Badge>}
              {configuration.preferNonFixed && <Badge variant="secondary">Prefer Non-Fixed</Badge>}
              {configuration.orderByQuantUpdatedAt && <Badge variant="secondary">Order by Quant Updated</Badge>}
              {configuration.orderByPickingPosition && <Badge variant="secondary">Order by Picking Position</Badge>}
              {configuration.useInventorySnapshotForPickSlotting && <Badge variant="secondary">Use Inventory Snapshot</Badge>}
            </div>
          </div>
        ) : (!isEditing && !configuration) ? (
          <div className="text-center py-6 text-gray-500">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No task planning configuration defined</p>
            <p className="text-xs">Click Configure to set up task planning for this inventory group</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          {taskKindOptions.map((option) => (
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
                  name="taskSubKind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Sub Kind *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task sub kind" {...field} />
                      </FormControl>
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
                          {stratOptions.map((option) => (
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
                  name="sortingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sorting Strategy *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sorting strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sortingStrategyOptions.map((option) => (
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
                  name="loadingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loading Strategy *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select loading strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingStrategyOptions.map((option) => (
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
                  name="taskLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Label *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task label" {...field} />
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
                      <FormLabel>Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modeOptions.map((option) => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter priority" 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="skipZoneFace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skip Zone Face *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {skipZoneFaceOptions.map((option) => (
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
                  name="searchScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Scope *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {searchScopeOptions.map((option) => (
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
                  name="batchPreferenceMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Preference Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {batchPreferenceModeOptions.map((option) => (
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
                  name="optimizationMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optimization Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {optimizationModeOptions.map((option) => (
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
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Boolean Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orderByQuantUpdatedAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Order by Quant Updated At</FormLabel>
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
                    name="preferFixed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Prefer Fixed</FormLabel>
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
                    name="preferNonFixed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Prefer Non-Fixed</FormLabel>
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
                    name="orderByPickingPosition"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Order by Picking Position</FormLabel>
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
                    name="useInventorySnapshotForPickSlotting"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Use Inventory Snapshot for Pick Slotting</FormLabel>
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