import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Star, Clock, Users } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function OneClickTemplates() {
  const templates = [
    {
      title: "E-commerce Fulfillment Setup",
      description: "Complete configuration for high-volume e-commerce operations with automated picking strategies",
      category: "E-commerce",
      estimatedTime: "5 minutes",
      complexity: "Beginner",
      rating: 4.8,
      downloads: 1240,
      lastUpdated: "1 week ago",
      features: [
        "Zone-based picking strategies",
        "Automated replenishment rules", 
        "Multi-channel inventory allocation",
        "Returns processing workflow"
      ]
    },
    {
      title: "3PL Multi-Client Configuration",
      description: "Template designed for third-party logistics providers managing multiple client inventories",
      category: "3PL",
      estimatedTime: "8 minutes", 
      complexity: "Advanced",
      rating: 4.6,
      downloads: 890,
      lastUpdated: "3 days ago",
      features: [
        "Client inventory segregation",
        "Billing-based task sequences",
        "Custom SLA configurations",
        "Multi-tenant reporting"
      ]
    },
    {
      title: "Manufacturing Warehouse Setup",
      description: "Optimized for manufacturing environments with raw materials and finished goods handling",
      category: "Manufacturing",
      estimatedTime: "12 minutes",
      complexity: "Intermediate", 
      rating: 4.7,
      downloads: 650,
      lastUpdated: "5 days ago",
      features: [
        "Raw material tracking",
        "Production line integration",
        "Quality control checkpoints",
        "Batch/lot management"
      ]
    },
    {
      title: "Cold Storage Operations",
      description: "Specialized template for temperature-controlled warehouse operations",
      category: "Cold Chain",
      estimatedTime: "10 minutes",
      complexity: "Intermediate",
      rating: 4.5, 
      downloads: 420,
      lastUpdated: "1 week ago",
      features: [
        "Temperature zone management",
        "FIFO/FEFO strategies",
        "Expiry date tracking",
        "Cold chain compliance"
      ]
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'E-commerce': return 'bg-blue-100 text-blue-800';
      case '3PL': return 'bg-purple-100 text-purple-800';
      case 'Manufacturing': return 'bg-orange-100 text-orange-800';
      case 'Cold Chain': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">One-Click Templates</h1>
          <p className="text-gray-600">
            Pre-configured warehouse setups for common industry scenarios. Deploy proven configurations in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge className={getComplexityColor(template.complexity)}>
                    {template.complexity}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {template.estimatedTime}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {template.downloads} uses
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {template.rating}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {template.features.slice(0, 3).map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                      {template.features.length > 3 && (
                        <li className="text-gray-500 ml-3.5">
                          +{template.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Apply Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Last updated: {template.lastUpdated}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}