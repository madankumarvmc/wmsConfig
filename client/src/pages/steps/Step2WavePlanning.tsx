import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Waves, 
  Clock, 
  Package, 
  Truck, 
  AlertCircle, 
  Plus, 
  Trash2,
  Edit,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';

const wavePlanningSchema = z.object({
  waveStrategy: z.string().min(1, 'Wave strategy is required'),
  waveSize: z.string().min(1, 'Wave size is required'),
  waveTiming: z.string().min(1, 'Wave timing is required'),
  priorityRules: z.array(z.string()).min(1, 'At least one priority rule is required'),
  autoRelease: z.boolean().default(false),
  releaseSchedule: z.string().optional(),
  batchingCriteria: z.string().min(1, 'Batching criteria is required'),
  consolidationRules: z.string().min(1, 'Consolidation rules are required'),
});

type WavePlanningFormData = z.infer<typeof wavePlanningSchema>;

interface WaveTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  maxOrders: number;
  timing: string;
  priority: string[];
}

export default function Step2WavePlanning() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<WavePlanningFormData>({
    resolver: zodResolver(wavePlanningSchema),
    defaultValues: {
      waveStrategy: '',
      waveSize: '',
      waveTiming: '',
      priorityRules: [],
      autoRelease: false,
      releaseSchedule: '',
      batchingCriteria: '',
      consolidationRules: '',
    },
  });

  const waveTemplates: WaveTemplate[] = [
    {
      id: 'ecommerce-standard',
      name: 'E-commerce Standard',
      description: 'Optimized for online retail with frequent small waves',
      strategy: 'Time-based',
      maxOrders: 100,
      timing: 'Every 2 hours',
      priority: ['Order Date', 'Customer Priority', 'Shipping Method']
    },
    {
      id: 'batch-processing',
      name: 'Batch Processing',
      description: 'Large batch waves for distribution centers',
      strategy: 'Volume-based',
      maxOrders: 500,
      timing: 'Twice daily',
      priority: ['Zone', 'Customer Type', 'Order Size']
    },
    {
      id: 'mixed-strategy',
      name: 'Mixed Strategy',
      description: 'Combines time and volume triggers',
      strategy: 'Hybrid',
      maxOrders: 250,
      timing: 'Dynamic',
      priority: ['SLA', 'Geography', 'Product Type']
    }
  ];

  const priorityOptions = [
    'Order Date',
    'Customer Priority',
    'Shipping Method',
    'Order Value',
    'Product Category',
    'Geographic Zone',
    'SLA Requirements',
    'Inventory Availability'
  ];

  const onSubmit = async (data: WavePlanningFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Wave planning configuration saved",
        description: "Your wave planning settings have been successfully saved.",
      });
      
      console.log('Wave planning data:', data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wave planning configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (form.formState.isValid || Object.keys(form.formState.errors).length === 0) {
      setLocation('/step/3');
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const handlePrevious = () => {
    setLocation('/step/1');
  };

  const applyTemplate = (template: WaveTemplate) => {
    form.setValue('waveStrategy', template.strategy);
    form.setValue('waveSize', template.maxOrders.toString());
    form.setValue('waveTiming', template.timing);
    form.setValue('priorityRules', template.priority);
    setSelectedTemplate(template.id);
    
    toast({
      title: "Template applied",
      description: `${template.name} configuration has been applied.`,
    });
  };

  return (
    <WizardLayout
      title="Wave Planning - Wave release Planning of orders"
      description="Configure wave release strategies, order batching rules, and line-split strategies for optimal picking efficiency"
      currentStep={2}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Information Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Wave planning determines how orders are grouped and released for picking. 
            Configure strategies that balance throughput with resource utilization.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="strategy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="strategy">Wave Strategy</TabsTrigger>
            <TabsTrigger value="line-split">Line-Split Strategies</TabsTrigger>
            <TabsTrigger value="templates">Quick Templates</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wave Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Waves className="w-5 h-5 mr-2" />
                    Wave Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="waveStrategy">Wave Strategy</Label>
                    <Select onValueChange={(value) => form.setValue('waveStrategy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wave strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time-based">Time-based Release</SelectItem>
                        <SelectItem value="volume-based">Volume-based Release</SelectItem>
                        <SelectItem value="hybrid">Hybrid Strategy</SelectItem>
                        <SelectItem value="priority-based">Priority-based</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.waveStrategy && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.waveStrategy.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waveSize">Max Orders per Wave</Label>
                      <Input
                        id="waveSize"
                        type="number"
                        {...form.register('waveSize')}
                        placeholder="e.g., 100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waveTiming">Release Frequency</Label>
                      <Select onValueChange={(value) => form.setValue('waveTiming', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="2-hours">Every 2 Hours</SelectItem>
                          <SelectItem value="4-hours">Every 4 Hours</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="on-demand">On Demand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Rules</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {priorityOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={option}
                            checked={form.watch('priorityRules')?.includes(option)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('priorityRules') || [];
                              if (checked) {
                                form.setValue('priorityRules', [...current, option]);
                              } else {
                                form.setValue('priorityRules', current.filter(item => item !== option));
                              }
                            }}
                          />
                          <Label htmlFor={option} className="text-sm">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Automation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoRelease"
                      checked={form.watch('autoRelease')}
                      onCheckedChange={(checked) => form.setValue('autoRelease', !!checked)}
                    />
                    <Label htmlFor="autoRelease">Enable Automatic Wave Release</Label>
                  </div>

                  {form.watch('autoRelease') && (
                    <div className="space-y-2">
                      <Label htmlFor="releaseSchedule">Release Schedule</Label>
                      <Select onValueChange={(value) => form.setValue('releaseSchedule', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business-hours">Business Hours Only</SelectItem>
                          <SelectItem value="24-7">24/7 Operation</SelectItem>
                          <SelectItem value="custom">Custom Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="batchingCriteria">Batching Criteria</Label>
                    <Select onValueChange={(value) => form.setValue('batchingCriteria', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zone">By Zone</SelectItem>
                        <SelectItem value="customer">By Customer</SelectItem>
                        <SelectItem value="product">By Product Type</SelectItem>
                        <SelectItem value="shipping">By Shipping Method</SelectItem>
                        <SelectItem value="mixed">Mixed Criteria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consolidationRules">Consolidation Rules</Label>
                    <Select onValueChange={(value) => form.setValue('consolidationRules', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same-customer">Same Customer Orders</SelectItem>
                        <SelectItem value="same-address">Same Shipping Address</SelectItem>
                        <SelectItem value="same-zone">Same Pick Zone</SelectItem>
                        <SelectItem value="no-consolidation">No Consolidation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {waveTemplates.map((template) => (
                <Card key={template.id} className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id ? 'border-black bg-gray-50' : ''
                }`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Strategy:</span>
                        <Badge variant="outline">{template.strategy}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Orders:</span>
                        <span>{template.maxOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timing:</span>
                        <span>{template.timing}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Priority Rules:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.priority.slice(0, 2).map((rule) => (
                          <Badge key={rule} variant="secondary" className="text-xs">
                            {rule}
                          </Badge>
                        ))}
                        {template.priority.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.priority.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => applyTemplate(template)}
                      className="w-full"
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                    >
                      {selectedTemplate === template.id ? "Applied" : "Apply Template"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* New Line-Split Strategies Tab */}
          <TabsContent value="line-split" className="space-y-6">
            <Card className="wms-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Line-Split Strategies Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Line-split strategies determine how order lines are divided and allocated across waves based on inventory group characteristics.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Split Strategy Configuration */}
                  <div className="space-y-4">
                    <h4 className="text-title-16 text-gray-900">Split Strategy Rules</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="splitCriteria">Split Criteria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select split criteria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inventory-group">By Inventory Group</SelectItem>
                            <SelectItem value="storage-zone">By Storage Zone</SelectItem>
                            <SelectItem value="product-category">By Product Category</SelectItem>
                            <SelectItem value="order-priority">By Order Priority</SelectItem>
                            <SelectItem value="customer-type">By Customer Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="maxLinesPerWave">Max Lines per Wave</Label>
                        <Input
                          id="maxLinesPerWave"
                          type="number"
                          placeholder="e.g., 500"
                          defaultValue={500}
                        />
                      </div>

                      <div>
                        <Label htmlFor="splitThreshold">Split Threshold</Label>
                        <Input
                          id="splitThreshold"
                          type="number"
                          placeholder="e.g., 100"
                          defaultValue={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum lines required before splitting into new wave
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Line Allocation Rules */}
                  <div className="space-y-4">
                    <h4 className="text-title-16 text-gray-900">Line Allocation Rules</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="allocationStrategy">Allocation Strategy</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select allocation strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="round-robin">Round Robin</SelectItem>
                            <SelectItem value="capacity-based">Capacity Based</SelectItem>
                            <SelectItem value="priority-weighted">Priority Weighted</SelectItem>
                            <SelectItem value="zone-optimized">Zone Optimized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="balancingFactor">Load Balancing Factor</Label>
                        <Input
                          id="balancingFactor"
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          placeholder="e.g., 0.8"
                          defaultValue={0.8}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          0 = No balancing, 1 = Perfect balancing
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox id="preserveOrderIntegrity" defaultChecked />
                        <Label htmlFor="preserveOrderIntegrity" className="text-sm">
                          Preserve order integrity when possible
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-title-14 text-gray-900 mb-3">Strategy Preview</h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-title-20 text-blue-600">85%</div>
                      <div className="text-body-12 text-gray-500">Wave Efficiency</div>
                    </div>
                    <div>
                      <div className="text-title-20 text-green-600">3.2</div>
                      <div className="text-body-12 text-gray-500">Avg Lines/Wave</div>
                    </div>
                    <div>
                      <div className="text-title-20 text-orange-600">12min</div>
                      <div className="text-body-12 text-gray-500">Est. Processing Time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Wave Planning Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced settings provide fine-grained control over wave planning. 
                    Modify these settings only if you have specific requirements.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Performance Settings</h3>
                    <div className="space-y-2">
                      <Label>Wave Overlap Threshold (%)</Label>
                      <Input type="number" placeholder="10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Resource Utilization Target (%)</Label>
                      <Input type="number" placeholder="85" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Exception Handling</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="holdShortPicks" />
                      <Label htmlFor="holdShortPicks">Hold waves with short picks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="autoSubstitute" />
                      <Label htmlFor="autoSubstitute">Enable auto substitution</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WizardLayout>
  );
}