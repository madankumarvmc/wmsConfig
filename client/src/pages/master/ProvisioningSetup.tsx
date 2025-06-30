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
import { Settings, Database, Building, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';

const provisioningSchema = z.object({
  warehouseName: z.string().min(1, 'Warehouse name is required'),
  warehouseCode: z.string().min(1, 'Warehouse code is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  defaultLanguage: z.string().min(1, 'Default language is required'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
  enableBarcodeScanners: z.boolean().default(false),
  enableRFIDTracking: z.boolean().default(false),
  enableVoicePicking: z.boolean().default(false),
  enableMobileDevices: z.boolean().default(true),
});

type ProvisioningFormData = z.infer<typeof provisioningSchema>;

export default function ProvisioningSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProvisioningFormData>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      warehouseName: '',
      warehouseCode: '',
      timezone: '',
      defaultLanguage: 'en',
      currency: 'USD',
      description: '',
      enableBarcodeScanners: true,
      enableRFIDTracking: false,
      enableVoicePicking: false,
      enableMobileDevices: true,
    },
  });

  const onSubmit = async (data: ProvisioningFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Provisioning setup saved",
        description: "Your warehouse configuration has been successfully saved.",
      });
      
      console.log('Provisioning data:', data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save provisioning setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const configurationSteps = [
    {
      icon: <Building className="w-5 h-5" />,
      title: "Basic Information",
      description: "Configure warehouse identity and location settings",
      completed: false
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "System Integration",
      description: "Connect with existing ERP and WMS systems",
      completed: false
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "User Management",
      description: "Set up user roles and permissions",
      completed: false
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Hardware Configuration",
      description: "Configure scanners, printers, and mobile devices",
      completed: false
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-8 h-8 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provisioning Setup</h1>
            <p className="text-gray-600">Configure your warehouse's basic settings and hardware integration</p>
          </div>
        </div>

        {/* Configuration Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Configuration Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {configurationSteps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    step.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div className={`${
                      step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className="ml-2 font-medium text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Configuration Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Warehouse Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="warehouseName">Warehouse Name</Label>
                      <Input
                        id="warehouseName"
                        {...form.register('warehouseName')}
                        placeholder="e.g., Main Distribution Center"
                      />
                      {form.formState.errors.warehouseName && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.warehouseName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouseCode">Warehouse Code</Label>
                      <Input
                        id="warehouseCode"
                        {...form.register('warehouseCode')}
                        placeholder="e.g., DC001"
                      />
                      {form.formState.errors.warehouseCode && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.warehouseCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select onValueChange={(value) => form.setValue('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="defaultLanguage">Default Language</Label>
                      <Select onValueChange={(value) => form.setValue('defaultLanguage', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select onValueChange={(value) => form.setValue('currency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Brief description of the warehouse..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Hardware Configuration</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enableBarcodeScanners"
                          checked={form.watch('enableBarcodeScanners')}
                          onCheckedChange={(checked) => form.setValue('enableBarcodeScanners', !!checked)}
                        />
                        <Label htmlFor="enableBarcodeScanners">Enable Barcode Scanners</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enableRFIDTracking"
                          checked={form.watch('enableRFIDTracking')}
                          onCheckedChange={(checked) => form.setValue('enableRFIDTracking', !!checked)}
                        />
                        <Label htmlFor="enableRFIDTracking">Enable RFID Tracking</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enableVoicePicking"
                          checked={form.watch('enableVoicePicking')}
                          onCheckedChange={(checked) => form.setValue('enableVoicePicking', !!checked)}
                        />
                        <Label htmlFor="enableVoicePicking">Enable Voice Picking</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enableMobileDevices"
                          checked={form.watch('enableMobileDevices')}
                          onCheckedChange={(checked) => form.setValue('enableMobileDevices', !!checked)}
                        />
                        <Label htmlFor="enableMobileDevices">Enable Mobile Devices</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline">
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {isLoading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-900">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium text-gray-900 mb-2">Warehouse Code</h4>
                  <p>Use a unique identifier that follows your organization's naming convention.</p>
                </div>
                <div className="text-sm text-gray-600">
                  <h4 className="font-medium text-gray-900 mb-2">Hardware Settings</h4>
                  <p>Enable only the hardware you have available. These settings can be changed later.</p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changes to basic settings may require system restart. Plan configuration updates during maintenance windows.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}