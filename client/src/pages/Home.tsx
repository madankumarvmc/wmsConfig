import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Settings, Database, Package, Users, Zap, CheckCircle, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Home() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isQuickSetupComplete, setIsQuickSetupComplete] = useState(false);

  // Check existing configurations
  const { data: taskSequences = [] } = useQuery<any[]>({
    queryKey: ['/api/task-sequences'],
  });

  const { data: pickStrategies = [] } = useQuery<any[]>({
    queryKey: ['/api/pick-strategies'],
  });

  const { data: inventoryGroups = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const hasExistingConfig = taskSequences.length > 0 || pickStrategies.length > 0 || inventoryGroups.length > 0;

  const quickSetupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/quick-setup');
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/task-sequences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pick-strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hu-formation'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-order-management'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-allocation-strategies'] });
      
      // Mark all steps as complete in wizard state
      [1, 2, 3, 4, 5].forEach(step => {
        dispatch({ type: 'COMPLETE_STEP', payload: step });
      });
      
      setIsQuickSetupComplete(true);
      toast({ 
        title: "Quick Setup Complete!", 
        description: `Created ${data.summary.taskSequences} task sequence, ${data.summary.pickStrategies} pick strategies, ${data.summary.inventoryGroups} inventory groups, and more.`
      });
    },
    onError: () => {
      toast({ 
        title: "Quick Setup Failed", 
        description: "There was an error setting up the default configuration.",
        variant: "destructive" 
      });
    }
  });

  const handleQuickSetup = () => {
    quickSetupMutation.mutate();
  };

  const handleStartWizard = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
    setLocation('/step1');
  };

  const wizardSteps = [
    {
      number: 1,
      title: "Task Sequences",
      description: "Define storage and line identifiers with task sequences",
      icon: <Package className="w-5 h-5" />,
      isComplete: state.completedSteps.includes(1)
    },
    {
      number: 2,
      title: "Pick Strategies",
      description: "Configure pick strategies with sorting and loading preferences",
      icon: <Zap className="w-5 h-5" />,
      isComplete: state.completedSteps.includes(2)
    },
    {
      number: 3,
      title: "HU Formation",
      description: "Set up handling unit formation rules and scanning requirements",
      icon: <Database className="w-5 h-5" />,
      isComplete: state.completedSteps.includes(3)
    },
    {
      number: 4,
      title: "Work Order Management",
      description: "Configure work order management settings and loading units",
      icon: <Settings className="w-5 h-5" />,
      isComplete: state.completedSteps.includes(4)
    },
    {
      number: 5,
      title: "Stock Allocation",
      description: "Define inventory groups with PICK and PUT allocation strategies",
      icon: <Users className="w-5 h-5" />,
      isComplete: state.completedSteps.includes(5)
    }
  ];

  const completedStepsCount = wizardSteps.filter(step => step.isComplete).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SBX WMS Outbound Module Setup
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Configure your warehouse management system with our guided setup wizard or use our one-click quick setup based on proven configurations.
          </p>
        </div>

        {/* Progress Overview */}
        {(hasExistingConfig || completedStepsCount > 0) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Configuration Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-blue-600">{completedStepsCount}/5</span>
                  <span className="text-gray-600 ml-2">steps completed</span>
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedStepsCount / 5) * 100}%` }}
                  />
                </div>
              </div>
              {isQuickSetupComplete && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Quick setup completed successfully! All default configurations have been applied. You can now review and customize each step as needed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Setup */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                Quick Setup
                <Badge className="ml-2 bg-blue-100 text-blue-800">Recommended</Badge>
              </CardTitle>
              <p className="text-gray-600">
                Apply proven warehouse configurations based on real production setups. Perfect for getting started quickly.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">What's included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• L0 and L2 UOM pick strategies</li>
                  <li>• OUTBOUND_REPLEN, OUTBOUND_PICK, OUTBOUND_LOAD sequence</li>
                  <li>• Pallet-based HU formation with BIN mapping</li>
                  <li>• Standard work order management settings</li>
                  <li>• Inventory groups with PICK/PUT allocation strategies</li>
                </ul>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Setup time: ~30 seconds
              </div>

              <Button 
                onClick={handleQuickSetup}
                disabled={quickSetupMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {quickSetupMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply Quick Setup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Manual Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-6 h-6 mr-2 text-gray-600" />
                Manual Setup
              </CardTitle>
              <p className="text-gray-600">
                Step-by-step guided configuration. Choose this option for custom setups or to learn about each configuration.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Perfect for:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Custom warehouse requirements</li>
                  <li>• Learning about WMS configurations</li>
                  <li>• Fine-tuning specific settings</li>
                  <li>• Understanding each setup step</li>
                </ul>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                Setup time: ~10-15 minutes
              </div>

              <Button 
                onClick={handleStartWizard}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Start Guided Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Existing Configuration Warning */}
        {hasExistingConfig && !isQuickSetupComplete && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <strong>Existing Configuration Detected:</strong> You have existing configurations in your system. Quick Setup will add additional configurations. Use the guided setup to review and modify existing settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Steps Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Steps</CardTitle>
            <p className="text-gray-600">
              Overview of the 5-step configuration process for setting up your WMS outbound module.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wizardSteps.map((step) => (
                <div
                  key={step.number}
                  className={`p-4 rounded-lg border transition-colors ${
                    step.isComplete 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                      step.isComplete 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.isComplete ? <CheckCircle className="w-4 h-4" /> : step.number}
                    </div>
                    {step.icon}
                    <h3 className="font-medium text-gray-900 ml-2">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
