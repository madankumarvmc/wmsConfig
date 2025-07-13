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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Settings, Timer, Zap, Activity } from 'lucide-react';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';
import { toast } from '@/hooks/use-toast';

interface ExecutionParameter {
  id: string;
  name: string;
  value: number | string | boolean;
  type: 'number' | 'text' | 'boolean' | 'range';
  min?: number;
  max?: number;
  unit?: string;
  description: string;
}

interface PerformanceMetric {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface ExecutionRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
}

export default function Step5TaskExecution() {
  const { currentStep, nextStep, previousStep } = useWizard();
  const queryClient = useQueryClient();

  const [executionParams, setExecutionParams] = useState<ExecutionParameter[]>([
    {
      id: 'batch_size',
      name: 'Batch Size',
      value: 10,
      type: 'number',
      min: 1,
      max: 100,
      unit: 'items',
      description: 'Number of items to process in each batch'
    },
    {
      id: 'timeout',
      name: 'Task Timeout',
      value: 300,
      type: 'range',
      min: 60,
      max: 3600,
      unit: 'seconds',
      description: 'Maximum time allowed for task completion'
    },
    {
      id: 'parallel_workers',
      name: 'Parallel Workers',
      value: 5,
      type: 'range',
      min: 1,
      max: 20,
      unit: 'workers',
      description: 'Number of workers processing tasks simultaneously'
    },
    {
      id: 'auto_retry',
      name: 'Auto Retry Failed Tasks',
      value: true,
      type: 'boolean',
      description: 'Automatically retry failed tasks'
    }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'throughput',
      name: 'Throughput',
      target: 100,
      current: 85,
      unit: 'items/hour',
      trend: 'up'
    },
    {
      id: 'accuracy',
      name: 'Pick Accuracy',
      target: 99.5,
      current: 98.7,
      unit: '%',
      trend: 'stable'
    },
    {
      id: 'completion_time',
      name: 'Avg Completion Time',
      target: 5,
      current: 6.2,
      unit: 'minutes',
      trend: 'down'
    }
  ]);

  const [executionRules, setExecutionRules] = useState<ExecutionRule[]>([
    {
      id: 'rule_1',
      name: 'High Priority Orders',
      condition: 'order.priority === "HIGH"',
      action: 'assign_to_fastest_worker',
      priority: 1,
      enabled: true
    },
    {
      id: 'rule_2',
      name: 'Large Orders',
      condition: 'order.item_count > 50',
      action: 'split_into_batches',
      priority: 2,
      enabled: true
    }
  ]);

  const saveConfiguration = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/task-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save task execution configuration');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution'] });
      toast({
        title: 'Success',
        description: 'Task execution configuration saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save task execution configuration.',
        variant: 'destructive',
      });
    },
  });

  const handleNext = async () => {
    const configuration = {
      executionParams,
      performanceMetrics,
      executionRules,
      currentStep: 5,
      userId: 1,
    };

    await saveConfiguration.mutateAsync(configuration);
    nextStep();
  };

  const updateParameter = (id: string, value: any) => {
    setExecutionParams(prev => 
      prev.map(param => 
        param.id === id ? { ...param, value } : param
      )
    );
  };

  const updateRule = (id: string, updates: Partial<ExecutionRule>) => {
    setExecutionRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
  };

  return (
    <WizardLayout
      title="Task Execution"
      description="Configure runtime parameters, performance monitoring, and execution rules"
      currentStep={currentStep}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={previousStep}
      isNextDisabled={saveConfiguration.isPending}
    >
      <div className="space-y-6">
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="parameters" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Execution Parameters
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitoring
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Execution Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parameters" className="space-y-4">
            <div>
              <h3 className="text-title-18 text-gray-900 mb-2">Runtime Parameters</h3>
              <p className="text-body-14 text-gray-500 mb-6">Configure execution settings for optimal performance</p>
            </div>

            <div className="grid gap-6">
              {executionParams.map((param) => (
                <Card key={param.id} className="wms-card">
                  <CardHeader>
                    <CardTitle className="text-title-16 flex items-center justify-between">
                      {param.name}
                      <Badge variant="outline">
                        {param.value} {param.unit}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{param.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {param.type === 'number' && (
                      <div className="space-y-2">
                        <Label htmlFor={param.id}>Value</Label>
                        <Input
                          id={param.id}
                          type="number"
                          value={param.value as number}
                          min={param.min}
                          max={param.max}
                          onChange={(e) => updateParameter(param.id, parseInt(e.target.value))}
                        />
                      </div>
                    )}
                    
                    {param.type === 'range' && (
                      <div className="space-y-4">
                        <Label htmlFor={param.id}>Value: {param.value} {param.unit}</Label>
                        <Slider
                          id={param.id}
                          min={param.min}
                          max={param.max}
                          step={1}
                          value={[param.value as number]}
                          onValueChange={(value) => updateParameter(param.id, value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{param.min} {param.unit}</span>
                          <span>{param.max} {param.unit}</span>
                        </div>
                      </div>
                    )}
                    
                    {param.type === 'boolean' && (
                      <div className="flex items-center justify-between">
                        <Label htmlFor={param.id}>Enable {param.name}</Label>
                        <Switch
                          id={param.id}
                          checked={param.value as boolean}
                          onCheckedChange={(checked) => updateParameter(param.id, checked)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div>
              <h3 className="text-title-18 text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-body-14 text-gray-500 mb-6">Monitor and track execution performance in real-time</p>
            </div>

            <div className="grid gap-4">
              {performanceMetrics.map((metric) => (
                <Card key={metric.id} className="wms-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-title-16">{metric.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                        >
                          {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current: {metric.current} {metric.unit}</span>
                      <span>Target: {metric.target} {metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500">
                      Performance: {((metric.current / metric.target) * 100).toFixed(1)}% of target
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="wms-card">
              <CardHeader>
                <CardTitle className="text-title-16">Real-time Execution Status</CardTitle>
                <CardDescription>Current system performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-title-20 text-blue-600">142</div>
                    <div className="text-body-12 text-gray-500">Active Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-title-20 text-green-600">1,247</div>
                    <div className="text-body-12 text-gray-500">Completed Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-title-20 text-orange-600">23</div>
                    <div className="text-body-12 text-gray-500">In Queue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-title-20 text-red-600">3</div>
                    <div className="text-body-12 text-gray-500">Failed Tasks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <div>
              <h3 className="text-title-18 text-gray-900 mb-2">Execution Rules</h3>
              <p className="text-body-14 text-gray-500 mb-6">Define conditional logic for task execution and routing</p>
            </div>

            <div className="grid gap-4">
              {executionRules.map((rule, index) => (
                <Card key={rule.id} className="wms-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-title-16">{rule.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority {rule.priority}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`rule-name-${index}`}>Rule Name</Label>
                      <Input
                        id={`rule-name-${index}`}
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`rule-condition-${index}`}>Condition</Label>
                      <Textarea
                        id={`rule-condition-${index}`}
                        value={rule.condition}
                        onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
                        placeholder="e.g., order.priority === 'HIGH'"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`rule-action-${index}`}>Action</Label>
                      <Textarea
                        id={`rule-action-${index}`}
                        value={rule.action}
                        onChange={(e) => updateRule(rule.id, { action: e.target.value })}
                        placeholder="e.g., assign_to_fastest_worker"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <Label htmlFor={`rule-priority-${index}`}>Priority</Label>
                          <Input
                            id={`rule-priority-${index}`}
                            type="number"
                            value={rule.priority}
                            min={1}
                            max={10}
                            onChange={(e) => updateRule(rule.id, { priority: parseInt(e.target.value) })}
                            className="w-20"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`rule-enabled-${index}`}>Enabled</Label>
                        <Switch
                          id={`rule-enabled-${index}`}
                          checked={rule.enabled}
                          onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WizardLayout>
  );
}