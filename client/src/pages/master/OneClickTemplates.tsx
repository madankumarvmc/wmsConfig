import { useState } from 'react';
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
import MainLayout from '@/components/MainLayout';

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
  const [deployingTemplate, setDeployingTemplate] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const { toast } = useToast();

  const templates: Template[] = [
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
    },
    {
      id: 'retail-chain',
      name: 'Retail Chain Hub',
      description: 'Store replenishment and retail distribution operations',
      industry: 'Retail',
      icon: <Truck className="w-6 h-6" />,
      features: [
        'Store allocation',
        'Replenishment planning',
        'Seasonal management',
        'Promotional handling',
        'Multi-location sync'
      ],
      configurationTime: '20 minutes',
      complexity: 'Intermediate'
    }
  ];

  const getComplexityColor = (complexity: Template['complexity']) => {
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

  const handleDeployTemplate = async (templateId: string) => {
    setDeployingTemplate(templateId);
    setDeploymentProgress(0);

    // Simulate deployment progress
    const progressInterval = setInterval(() => {
      setDeploymentProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setDeployingTemplate(null);
          
          toast({
            title: "Template deployed successfully",
            description: "Your warehouse configuration has been applied. You can now customize the settings.",
          });
          
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownloadTemplate = (templateName: string) => {
    toast({
      title: "Template downloaded",
      description: `${templateName} configuration file has been downloaded.`,
    });
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
          {templates.map((template) => (
            <Card key={template.id} className={`relative ${template.isPopular ? 'border-black' : ''}`}>
              {template.isPopular && (
                <Badge className="absolute -top-2 -right-2 bg-black text-white">
                  Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="text-black">{template.icon}</div>
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
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.features.map((feature, index) => (
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
                    Setup time: {template.configurationTime}
                  </span>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template.name)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeployTemplate(template.id)}
                    disabled={deployingTemplate === template.id}
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {deployingTemplate === template.id ? 'Deploying...' : 'Deploy'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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