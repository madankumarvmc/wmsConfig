import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Zap, 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  Building, 
  ShoppingCart,
  Download,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/MainLayout';
import type { OneClickTemplate } from '../../../../shared/schema';

interface Template {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: React.ReactNode;
  features: string[];
  configurationTime: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  isPopular?: boolean;
}

export default function OneClickTemplates() {
  const [, setLocation] = useLocation();
  const [deployingTemplate, setDeployingTemplate] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<OneClickTemplate[]>({
    queryKey: ['/api/templates'],
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest('POST', `/api/templates/${templateId}/apply`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Template Applied Successfully",
        description: "Your warehouse configuration has been set up. Redirecting to configuration wizard.",
      });
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-sequences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-planning'] });
      queryClient.invalidateQueries({ queryKey: ['/api/task-execution'] });
      
      // Redirect to step 1 after a brief delay
      setTimeout(() => {
        setLocation('/step/1');
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Application Failed",
        description: "Failed to apply template. Please try again.",
        variant: "destructive"
      });
      setDeployingTemplate(null);
      setDeploymentProgress(0);
    }
  });

  const deployTemplate = async (templateId: string) => {
    const numericId = parseInt(templateId);
    setDeployingTemplate(templateId);
    setDeploymentProgress(0);

    // Simulate deployment progress
    const progressSteps = [10, 25, 40, 60, 80, 100];
    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDeploymentProgress(progress);
    }

    // Apply the template
    applyTemplateMutation.mutate(numericId);
  };

  // Fallback mock templates for display if API fails
  const mockTemplates: Template[] = [
    {
      id: 'ecommerce-basic',
      name: 'E-commerce Fulfillment',
      description: 'Optimized for online retail with standard pick, pack, and ship operations',
      industry: 'E-commerce',
      icon: <ShoppingCart className="w-6 h-6" />,
      features: [
        'Single-item picking',
        'Standard packaging',
        'Shipping integration',
        'Inventory tracking',
        'Order prioritization'
      ],
      configurationTime: '15 minutes',
      complexity: 'Basic',
      isPopular: true
    },
    {
      id: 'distribution-center',
      name: 'Distribution Center',
      description: 'High-volume distribution with batch picking and cross-docking capabilities',
      industry: 'Distribution',
      icon: <Building className="w-6 h-6" />,
      features: [
        'Batch picking',
        'Cross-docking',
        'Multi-zone operations',
        'Advanced routing',
        'Load planning'
      ],
      configurationTime: '25 minutes',
      complexity: 'Advanced',
      isPopular: true
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing Warehouse',
      description: 'Raw materials and finished goods with production support',
      industry: 'Manufacturing',
      icon: <Package className="w-6 h-6" />,
      features: [
        'Raw material handling',
        'WIP tracking',
        'Finished goods',
        'Quality control',
        'Kitting operations'
      ],
      configurationTime: '30 minutes',
      complexity: 'Advanced'
    }
  ];

  const getTemplateIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'distribution':
        return <Building className="w-6 h-6" />;
      case 'e-commerce':
        return <ShoppingCart className="w-6 h-6" />;
      case 'manufacturing':
        return <Package className="w-6 h-6" />;
      case 'retail':
        return <Truck className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getTemplateFeatures = (templateData: any) => {
    if (!templateData) return [];
    
    const features = [];
    if (templateData.taskSequence?.taskSequences) {
      features.push(`${templateData.taskSequence.taskSequences.length} task sequences`);
    }
    if (templateData.inventoryGroups?.length) {
      features.push(`${templateData.inventoryGroups.length} inventory groups`);
    }
    if (templateData.taskPlanning?.strategy) {
      features.push(`${templateData.taskPlanning.strategy} strategy`);
    }
    if (templateData.taskExecution) {
      features.push('Task execution rules');
    }
    return features.length ? features : ['Complete configuration'];
  };

  const getEstimatedTime = (complexity: string) => {
    switch (complexity) {
      case 'Basic':
        return '10 minutes';
      case 'Intermediate':
        return '20 minutes';
      case 'Advanced':
        return '30 minutes';
      default:
        return '15 minutes';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Basic':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="w-8 h-8 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">One-Click Templates</h1>
            <p className="text-gray-600">Deploy pre-configured warehouse setups based on industry best practices</p>
          </div>
        </div>

        {/* Deployment Progress */}
        {deployingTemplate && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Deploying template configuration...</span>
                  <span className="text-sm font-medium">{deploymentProgress}%</span>
                </div>
                <Progress value={deploymentProgress} className="w-full" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Information Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These templates provide a complete warehouse configuration based on industry standards. 
            After deployment, you can customize settings to match your specific requirements.
          </AlertDescription>
        </Alert>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id} className="relative border-black">
                <Badge className="absolute -top-2 -right-2 bg-black text-white">
                  Ready
                </Badge>
                
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="text-black">{getTemplateIcon(template.industry)}</div>
                    <div>
                      <span>{template.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {template.industry}
                        </Badge>
                        <Badge className={`text-xs ${getComplexityColor(template.complexity)}`}>
                          {template.complexity}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                  <p className="text-gray-600">{template.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Includes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {getTemplateFeatures(template.templateData).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Setup time: {getEstimatedTime(template.complexity)}
                    </span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => deployTemplate(template.id.toString())}
                      disabled={deployingTemplate === template.id.toString() || applyTemplateMutation.isPending}
                      className="flex-1 bg-black hover:bg-gray-800 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {deployingTemplate === template.id.toString() ? 'Applying...' : 'Apply Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No templates available</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Template Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Need a custom template for your specific industry or workflow? Our team can create 
              tailored templates based on your requirements.
            </p>
            <Button variant="outline">
              Request Custom Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}