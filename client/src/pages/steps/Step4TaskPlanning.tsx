import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Settings, Target, Package, Brain } from 'lucide-react';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';
import { toast } from '@/hooks/use-toast';

interface PickStrategy {
  id: string;
  name: string;
  type: 'FIFO' | 'LIFO' | 'OPTIMAL_PATH' | 'ZONE_BASED';
  priority: number;
  enabled: boolean;
  rules: PickRule[];
}

interface PickRule {
  id: string;
  condition: string;
  action: string;
  priority: number;
}

interface HUFormationConfig {
  id: string;
  name: string;
  maxWeight: number;
  maxVolume: number;
  maxItems: number;
  strategy: 'WEIGHT_BASED' | 'VOLUME_BASED' | 'COUNT_BASED' | 'MIXED';
  enabled: boolean;
}

interface WorkOrderConfig {
  id: string;
  name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  autoAssign: boolean;
  maxConcurrentOrders: number;
  timeoutMinutes: number;
}

export default function Step4TaskPlanning() {
  const { currentStep, nextStep, previousStep } = useWizard();
  const queryClient = useQueryClient();

  const [pickStrategies, setPickStrategies] = useState<PickStrategy[]>([]);
  const [huConfigs, setHuConfigs] = useState<HUFormationConfig[]>([]);
  const [workOrderConfigs, setWorkOrderConfigs] = useState<WorkOrderConfig[]>([]);

  const { data: inventoryGroups } = useQuery({
    queryKey: ['/api/inventory-groups'],
  });

  const saveConfiguration = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/task-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save task planning configuration');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning'] });
      toast({
        title: 'Success',
        description: 'Task planning configuration saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save task planning configuration.',
        variant: 'destructive',
      });
    },
  });

  const handleNext = async () => {
    const configuration = {
      pickStrategies,
      huConfigs,
      workOrderConfigs,
      currentStep: 4,
      userId: 1,
    };

    await saveConfiguration.mutateAsync(configuration);
    nextStep();
  };

  const addPickStrategy = () => {
    const newStrategy: PickStrategy = {
      id: `strategy-${Date.now()}`,
      name: `Pick Strategy ${pickStrategies.length + 1}`,
      type: 'FIFO',
      priority: pickStrategies.length + 1,
      enabled: true,
      rules: [],
    };
    setPickStrategies([...pickStrategies, newStrategy]);
  };

  const addHUConfig = () => {
    const newConfig: HUFormationConfig = {
      id: `hu-${Date.now()}`,
      name: `HU Formation ${huConfigs.length + 1}`,
      maxWeight: 50,
      maxVolume: 100,
      maxItems: 20,
      strategy: 'MIXED',
      enabled: true,
    };
    setHuConfigs([...huConfigs, newConfig]);
  };

  const addWorkOrderConfig = () => {
    const newConfig: WorkOrderConfig = {
      id: `wo-${Date.now()}`,
      name: `Work Order ${workOrderConfigs.length + 1}`,
      priority: 'MEDIUM',
      autoAssign: true,
      maxConcurrentOrders: 5,
      timeoutMinutes: 60,
    };
    setWorkOrderConfigs([...workOrderConfigs, newConfig]);
  };

  return (
    <WizardLayout
      title="Task Planning"
      description="Configure pick strategies, HU formation rules, and work order management settings"
      currentStep={currentStep}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={previousStep}
      isNextDisabled={saveConfiguration.isPending}
    >
      <div className="space-y-6">
        <Tabs defaultValue="pick-strategies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pick-strategies" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Pick Strategies
            </TabsTrigger>
            <TabsTrigger value="hu-formation" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              HU Formation
            </TabsTrigger>
            <TabsTrigger value="work-orders" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Work Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pick-strategies" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-title-18 text-gray-900">Pick Strategy Configuration</h3>
                <p className="text-body-14 text-gray-500">Define how items should be picked from inventory</p>
              </div>
              <Button onClick={addPickStrategy} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Strategy
              </Button>
            </div>

            {pickStrategies.length === 0 ? (
              <Card className="wms-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-title-16 text-gray-900 mb-2">No Pick Strategies Configured</h3>
                  <p className="text-body-14 text-gray-500 text-center mb-4">
                    Start by adding a pick strategy to define how items should be selected from inventory.
                  </p>
                  <Button onClick={addPickStrategy} className="wms-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Strategy
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pickStrategies.map((strategy, index) => (
                  <Card key={strategy.id} className="wms-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-title-16">{strategy.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={strategy.enabled ? "default" : "secondary"}>
                            {strategy.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updated = pickStrategies.filter(s => s.id !== strategy.id);
                              setPickStrategies(updated);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`strategy-name-${index}`}>Strategy Name</Label>
                          <Input
                            id={`strategy-name-${index}`}
                            value={strategy.name}
                            onChange={(e) => {
                              const updated = [...pickStrategies];
                              updated[index].name = e.target.value;
                              setPickStrategies(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`strategy-type-${index}`}>Strategy Type</Label>
                          <Select
                            value={strategy.type}
                            onValueChange={(value: PickStrategy['type']) => {
                              const updated = [...pickStrategies];
                              updated[index].type = value;
                              setPickStrategies(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FIFO">First In, First Out</SelectItem>
                              <SelectItem value="LIFO">Last In, First Out</SelectItem>
                              <SelectItem value="OPTIMAL_PATH">Optimal Path</SelectItem>
                              <SelectItem value="ZONE_BASED">Zone Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`strategy-enabled-${index}`}>Enable Strategy</Label>
                        <Switch
                          id={`strategy-enabled-${index}`}
                          checked={strategy.enabled}
                          onCheckedChange={(checked) => {
                            const updated = [...pickStrategies];
                            updated[index].enabled = checked;
                            setPickStrategies(updated);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hu-formation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-title-18 text-gray-900">HU Formation Configuration</h3>
                <p className="text-body-14 text-gray-500">Define handling unit formation rules and constraints</p>
              </div>
              <Button onClick={addHUConfig} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Configuration
              </Button>
            </div>

            {huConfigs.length === 0 ? (
              <Card className="wms-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-title-16 text-gray-900 mb-2">No HU Formation Rules</h3>
                  <p className="text-body-14 text-gray-500 text-center mb-4">
                    Configure handling unit formation rules to optimize packaging and shipping.
                  </p>
                  <Button onClick={addHUConfig} className="wms-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {huConfigs.map((config, index) => (
                  <Card key={config.id} className="wms-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-title-16">{config.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = huConfigs.filter(c => c.id !== config.id);
                            setHuConfigs(updated);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`hu-name-${index}`}>Configuration Name</Label>
                          <Input
                            id={`hu-name-${index}`}
                            value={config.name}
                            onChange={(e) => {
                              const updated = [...huConfigs];
                              updated[index].name = e.target.value;
                              setHuConfigs(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`hu-strategy-${index}`}>Formation Strategy</Label>
                          <Select
                            value={config.strategy}
                            onValueChange={(value: HUFormationConfig['strategy']) => {
                              const updated = [...huConfigs];
                              updated[index].strategy = value;
                              setHuConfigs(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WEIGHT_BASED">Weight Based</SelectItem>
                              <SelectItem value="VOLUME_BASED">Volume Based</SelectItem>
                              <SelectItem value="COUNT_BASED">Count Based</SelectItem>
                              <SelectItem value="MIXED">Mixed Strategy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`hu-weight-${index}`}>Max Weight (kg)</Label>
                          <Input
                            id={`hu-weight-${index}`}
                            type="number"
                            value={config.maxWeight}
                            onChange={(e) => {
                              const updated = [...huConfigs];
                              updated[index].maxWeight = parseInt(e.target.value);
                              setHuConfigs(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`hu-volume-${index}`}>Max Volume (L)</Label>
                          <Input
                            id={`hu-volume-${index}`}
                            type="number"
                            value={config.maxVolume}
                            onChange={(e) => {
                              const updated = [...huConfigs];
                              updated[index].maxVolume = parseInt(e.target.value);
                              setHuConfigs(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`hu-items-${index}`}>Max Items</Label>
                          <Input
                            id={`hu-items-${index}`}
                            type="number"
                            value={config.maxItems}
                            onChange={(e) => {
                              const updated = [...huConfigs];
                              updated[index].maxItems = parseInt(e.target.value);
                              setHuConfigs(updated);
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="work-orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-title-18 text-gray-900">Work Order Management</h3>
                <p className="text-body-14 text-gray-500">Configure work order creation and assignment rules</p>
              </div>
              <Button onClick={addWorkOrderConfig} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Configuration
              </Button>
            </div>

            {workOrderConfigs.length === 0 ? (
              <Card className="wms-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-title-16 text-gray-900 mb-2">No Work Order Rules</h3>
                  <p className="text-body-14 text-gray-500 text-center mb-4">
                    Set up work order management rules to automate task assignment and prioritization.
                  </p>
                  <Button onClick={addWorkOrderConfig} className="wms-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {workOrderConfigs.map((config, index) => (
                  <Card key={config.id} className="wms-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-title-16">{config.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = workOrderConfigs.filter(c => c.id !== config.id);
                            setWorkOrderConfigs(updated);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`wo-name-${index}`}>Configuration Name</Label>
                          <Input
                            id={`wo-name-${index}`}
                            value={config.name}
                            onChange={(e) => {
                              const updated = [...workOrderConfigs];
                              updated[index].name = e.target.value;
                              setWorkOrderConfigs(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`wo-priority-${index}`}>Priority Level</Label>
                          <Select
                            value={config.priority}
                            onValueChange={(value: WorkOrderConfig['priority']) => {
                              const updated = [...workOrderConfigs];
                              updated[index].priority = value;
                              setWorkOrderConfigs(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`wo-concurrent-${index}`}>Max Concurrent Orders</Label>
                          <Input
                            id={`wo-concurrent-${index}`}
                            type="number"
                            value={config.maxConcurrentOrders}
                            onChange={(e) => {
                              const updated = [...workOrderConfigs];
                              updated[index].maxConcurrentOrders = parseInt(e.target.value);
                              setWorkOrderConfigs(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`wo-timeout-${index}`}>Timeout (minutes)</Label>
                          <Input
                            id={`wo-timeout-${index}`}
                            type="number"
                            value={config.timeoutMinutes}
                            onChange={(e) => {
                              const updated = [...workOrderConfigs];
                              updated[index].timeoutMinutes = parseInt(e.target.value);
                              setWorkOrderConfigs(updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`wo-auto-${index}`}>Auto-assign Orders</Label>
                        <Switch
                          id={`wo-auto-${index}`}
                          checked={config.autoAssign}
                          onCheckedChange={(checked) => {
                            const updated = [...workOrderConfigs];
                            updated[index].autoAssign = checked;
                            setWorkOrderConfigs(updated);
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WizardLayout>
  );
}