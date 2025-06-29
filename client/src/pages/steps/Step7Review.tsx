import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, Download, FileText, Settings, Package, Database, Users, Zap, ExternalLink } from 'lucide-react';

import WizardLayout from '@/components/WizardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ConfigurationSummary {
  taskSequences: any[];
  pickStrategies: any[];
  huFormations: any[];
  workOrderManagement: any[];
  inventoryGroups: any[];
  stockAllocationStrategies: any[];
}

export default function Step6Review() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch all configuration data
  const { data: taskSequences = [] } = useQuery<any[]>({
    queryKey: ['/api/task-sequences'],
  });

  const { data: pickStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const { data: huFormations = [] } = useQuery<any[]>({
    queryKey: ['/api/hu-formation'],
  });

  const { data: workOrderManagement = [] } = useQuery<any[]>({
    queryKey: ['/api/work-order-management'],
  });

  const { data: inventoryGroups = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const { data: stockAllocationStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/stock-allocation-strategies'],
  });

  const configurationSummary: ConfigurationSummary = {
    taskSequences,
    pickStrategies,
    huFormations,
    workOrderManagement,
    inventoryGroups,
    stockAllocationStrategies,
  };

  // Calculate completion status
  const getStepStatus = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return taskSequences.length > 0 ? 'complete' : 'incomplete';
      case 2: return pickStrategies.length > 0 ? 'complete' : 'incomplete';
      case 3: return huFormations.length > 0 ? 'complete' : 'incomplete';
      case 4: return workOrderManagement.length > 0 ? 'complete' : 'incomplete';
      case 5: 
        const configuredGroups = inventoryGroups.filter(group => {
          const strategies = stockAllocationStrategies.filter(s => s.inventoryGroupId === group.id);
          return strategies.length === 2; // Must have both PICK and PUT
        });
        return configuredGroups.length > 0 ? 'complete' : 'incomplete';
      default: return 'incomplete';
    }
  };

  const allStepsComplete = [1, 2, 3, 4, 5].every(step => getStepStatus(step) === 'complete');

  const exportConfigurationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/export-configuration');
      return response.json();
    },
    onSuccess: (data) => {
      // Download configuration as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wms-configuration-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Configuration exported successfully" });
    },
    onError: () => {
      toast({ title: "Failed to export configuration", variant: "destructive" });
    }
  });

  const deployConfigurationMutation = useMutation({
    mutationFn: async () => {
      setIsDeploying(true);
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, deploymentId: `dep_${Date.now()}` };
    },
    onSuccess: () => {
      dispatch({ type: 'COMPLETE_STEP', payload: 6 });
      toast({ 
        title: "Configuration Deployed Successfully", 
        description: "Your SBX WMS Outbound Module configuration has been deployed." 
      });
      setIsDeploying(false);
    },
    onError: () => {
      toast({ 
        title: "Deployment Failed", 
        description: "There was an error deploying your configuration.",
        variant: "destructive" 
      });
      setIsDeploying(false);
    }
  });

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    setLocation('/step5');
  };

  const handleDeploy = () => {
    if (!allStepsComplete) {
      toast({ 
        title: "Configuration Incomplete", 
        description: "Please complete all steps before deploying.",
        variant: "destructive" 
      });
      return;
    }
    deployConfigurationMutation.mutate();
  };

  const handleExportConfiguration = () => {
    exportConfigurationMutation.mutate();
  };

  const renderConfigurationCard = (
    title: string,
    icon: React.ReactNode,
    data: any[],
    stepNumber: number,
    description: string
  ) => {
    const status = getStepStatus(stepNumber);
    const count = data.length;

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              {icon}
              <span className="ml-2">{title}</span>
            </CardTitle>
            <Badge 
              variant={status === 'complete' ? 'default' : 'secondary'}
              className={status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {status === 'complete' ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Complete</>
              ) : (
                <><AlertTriangle className="w-3 h-3 mr-1" /> Incomplete</>
              )}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Configurations:</span>
              <span className="text-2xl font-bold text-blue-600">{count}</span>
            </div>
            
            {count > 0 && (
              <div className="space-y-2">
                {data.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    <div className="font-medium">{item.name || `Configuration ${index + 1}`}</div>
                    {item.taskType && (
                      <div className="text-xs text-gray-500">Type: {item.taskType}</div>
                    )}
                    {item.mode && (
                      <div className="text-xs text-gray-500">Mode: {item.mode}</div>
                    )}
                    {item.priority && (
                      <div className="text-xs text-gray-500">Priority: {item.priority}</div>
                    )}
                  </div>
                ))}
                {count > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{count - 3} more configurations
                  </div>
                )}
              </div>
            )}
            
            {count === 0 && (
              <div className="text-center py-4 text-gray-500">
                <div className="text-sm">No configurations created</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation(`/step${stepNumber}`)}
                >
                  Configure Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <WizardLayout
      title="Review & Confirm Configuration"
      description="Review all your WMS configurations and deploy to complete the setup."
      currentStep={6}
      totalSteps={6}
      onPrevious={handlePrevious}
      previousLabel="Previous: Stock Allocation"
      isNextDisabled={true}
    >
      {/* Overall Status */}
      <Alert className={`mb-6 ${allStepsComplete ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        {allStepsComplete ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        )}
        <AlertDescription className={allStepsComplete ? 'text-green-700' : 'text-orange-700'}>
          <strong>Configuration Status:</strong> {allStepsComplete 
            ? 'All steps completed successfully. Ready for deployment.' 
            : 'Some configurations are incomplete. Please review and complete all steps.'
          }
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Review</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Configuration Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderConfigurationCard(
              "Task Sequences",
              <Package className="w-5 h-5" />,
              taskSequences,
              1,
              "Define storage and line identifiers with task sequences"
            )}
            
            {renderConfigurationCard(
              "Pick Strategies",
              <Zap className="w-5 h-5" />,
              pickStrategies,
              2,
              "Configure pick strategies with sorting and loading preferences"
            )}
            
            {renderConfigurationCard(
              "HU Formation",
              <Database className="w-5 h-5" />,
              huFormations,
              3,
              "Set up handling unit formation rules and scanning requirements"
            )}
            
            {renderConfigurationCard(
              "Work Order Management",
              <Settings className="w-5 h-5" />,
              workOrderManagement,
              4,
              "Configure work order management settings and loading units"
            )}
            
            {renderConfigurationCard(
              "Stock Allocation",
              <Users className="w-5 h-5" />,
              inventoryGroups,
              5,
              "Define inventory groups with PICK and PUT allocation strategies"
            )}
          </div>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Completed Steps:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {[1, 2, 3, 4, 5].filter(step => getStepStatus(step) === 'complete').length}/5
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${([1, 2, 3, 4, 5].filter(step => getStepStatus(step) === 'complete').length / 5) * 100}%` 
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className="text-center">
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                        getStepStatus(step) === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      Step {step}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="space-y-6">
            {/* Task Sequences Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Task Sequences ({taskSequences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {taskSequences.length > 0 ? (
                  <div className="space-y-3">
                    {taskSequences.map((config, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium">Storage Identifiers</h4>
                            <div className="text-sm text-gray-600">
                              {Object.entries(config.storageIdentifiers || {}).map(([key, value]) => (
                                <div key={key}>{key}: {value as string}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">Line Identifiers</h4>
                            <div className="text-sm text-gray-600">
                              {Object.entries(config.lineIdentifiers || {}).map(([key, value]) => (
                                <div key={key}>{key}: {value as string}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium">Task Sequences</h4>
                            <div className="text-sm text-gray-600">
                              {config.taskSequences?.map((seq: string, i: number) => (
                                <Badge key={i} variant="outline" className="mr-1 mb-1">{seq}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No task sequences configured
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Allocation Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Stock Allocation ({inventoryGroups.length} groups, {stockAllocationStrategies.length} strategies)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryGroups.length > 0 ? (
                  <div className="space-y-4">
                    {inventoryGroups.map((group) => {
                      const groupStrategies = stockAllocationStrategies.filter(s => s.inventoryGroupId === group.id);
                      return (
                        <div key={group.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{group.name}</h4>
                            <Badge variant={groupStrategies.length === 2 ? 'default' : 'secondary'}>
                              {groupStrategies.length === 2 ? 'Complete' : 'Incomplete'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['PICK', 'PUT'].map(mode => {
                              const strategy = groupStrategies.find(s => s.mode === mode);
                              return (
                                <div key={mode} className="bg-gray-50 rounded p-3">
                                  <h5 className="font-medium text-sm">{mode} Strategy</h5>
                                  {strategy ? (
                                    <div className="text-xs text-gray-600 mt-1">
                                      <div>Priority: {strategy.priority}</div>
                                      <div>Search Scope: {strategy.searchScope}</div>
                                      <div>Optimization: {strategy.optimizationMode}</div>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-orange-600 mt-1">Not configured</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No inventory groups configured
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Deploy your SBX WMS Outbound Module configuration to production environment.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pre-deployment Checklist */}
              <div className="space-y-3">
                <h3 className="font-medium">Pre-deployment Checklist</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Task Sequences configured', completed: getStepStatus(1) === 'complete' },
                    { label: 'Pick Strategies defined', completed: getStepStatus(2) === 'complete' },
                    { label: 'HU Formation rules set', completed: getStepStatus(3) === 'complete' },
                    { label: 'Work Order Management configured', completed: getStepStatus(4) === 'complete' },
                    { label: 'Stock Allocation strategies defined', completed: getStepStatus(5) === 'complete' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={item.completed ? 'text-green-700' : 'text-orange-700'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleExportConfiguration}
                  variant="outline"
                  disabled={exportConfigurationMutation.isPending}
                  className="flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportConfigurationMutation.isPending ? 'Exporting...' : 'Export Configuration'}
                </Button>

                <Button
                  onClick={handleDeploy}
                  disabled={!allStepsComplete || isDeploying}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                >
                  {isDeploying ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy to Production
                    </>
                  )}
                </Button>
              </div>

              {!allStepsComplete && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    Complete all configuration steps before deploying to production.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </WizardLayout>
  );
}