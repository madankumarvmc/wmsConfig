import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings2, Server, Database, Cloud, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function ProvisioningSetup() {
  const provisioningSteps = [
    {
      title: "Database Connection",
      description: "Configure your warehouse database connection settings",
      status: "completed",
      icon: <Database className="w-6 h-6" />
    },
    {
      title: "Server Configuration", 
      description: "Set up server endpoints and API configurations",
      status: "in-progress",
      icon: <Server className="w-6 h-6" />
    },
    {
      title: "Cloud Integration",
      description: "Connect to cloud services and external systems",
      status: "pending",
      icon: <Cloud className="w-6 h-6" />
    },
    {
      title: "System Validation",
      description: "Validate all connections and configurations",
      status: "pending", 
      icon: <Settings2 className="w-6 h-6" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Provisioning Setup</h1>
          <p className="text-gray-600">
            Configure your warehouse management system's core infrastructure and connections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Setup Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings2 className="w-5 h-5 mr-2" />
                Setup Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {provisioningSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className={`p-2 rounded-lg ${getStatusColor(step.status)}`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        {getStatusIcon(step.status)}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {step.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Settings2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Ready</h3>
                  <p className="text-gray-600 mb-4">
                    Your warehouse management system is configured and ready for use.
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    Active Environment
                  </Badge>
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Configuration Progress</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>

                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  Continue Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}