import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  FileUp,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';

interface UploadJob {
  id: string;
  name: string;
  type: 'products' | 'locations' | 'customers' | 'suppliers';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
}

export default function MasterUploads() {
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([
    {
      id: '1',
      name: 'Product Master Data',
      type: 'products',
      status: 'completed',
      progress: 100,
      recordsProcessed: 1250,
      totalRecords: 1250,
      startTime: '2025-06-30T08:00:00Z',
      endTime: '2025-06-30T08:05:00Z'
    },
    {
      id: '2',
      name: 'Location Hierarchy',
      type: 'locations',
      status: 'processing',
      progress: 65,
      recordsProcessed: 325,
      totalRecords: 500,
      startTime: '2025-06-30T08:15:00Z'
    }
  ]);

  const { toast } = useToast();

  const uploadTemplates = [
    {
      name: 'Product Master Template',
      description: 'Upload product information including SKU, description, dimensions, and attributes',
      type: 'products',
      icon: <FileText className="w-6 h-6" />,
      fields: ['SKU', 'Description', 'Category', 'Weight', 'Dimensions', 'UOM']
    },
    {
      name: 'Location Master Template',
      description: 'Define warehouse locations, zones, and storage areas',
      type: 'locations',
      icon: <Database className="w-6 h-6" />,
      fields: ['Location Code', 'Zone', 'Aisle', 'Level', 'Position', 'Type']
    },
    {
      name: 'Customer Master Template',
      description: 'Customer information and shipping addresses',
      type: 'customers',
      icon: <FileText className="w-6 h-6" />,
      fields: ['Customer ID', 'Name', 'Address', 'Contact', 'Preferences']
    },
    {
      name: 'Supplier Master Template',
      description: 'Supplier details and procurement information',
      type: 'suppliers',
      icon: <FileText className="w-6 h-6" />,
      fields: ['Supplier ID', 'Name', 'Address', 'Contact', 'Terms']
    }
  ];

  const getStatusIcon = (status: UploadJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: UploadJob['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const handleTemplateDownload = (templateType: string) => {
    toast({
      title: "Template downloaded",
      description: `${templateType} template has been downloaded to your device.`,
    });
  };

  const handleFileUpload = (templateType: string) => {
    toast({
      title: "Upload started",
      description: `Your ${templateType} file is being processed.`,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-8 h-8 text-black" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Master Uploads</h1>
            <p className="text-gray-600">Import and export master data for your warehouse configuration</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Download the template file first, fill in your data, then upload the completed file. Ensure all required fields are completed.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadTemplates.map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="text-black">{template.icon}</div>
                      <span>{template.name}</span>
                    </CardTitle>
                    <p className="text-gray-600">{template.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplateDownload(template.name)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleFileUpload(template.name)}
                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                      >
                        <FileUp className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {uploadTemplates.map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="text-black">{template.icon}</div>
                      <span>{template.name.replace('Template', 'Export')}</span>
                    </CardTitle>
                    <p className="text-gray-600">Export current {template.type} data from the system</p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleTemplateDownload(`${template.name} Export`)}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Upload Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(job.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">{job.name}</h3>
                            <p className="text-sm text-gray-600">
                              Started: {new Date(job.startTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>

                      {job.status === 'processing' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{job.recordsProcessed}/{job.totalRecords} records</span>
                          </div>
                          <Progress value={job.progress} className="w-full" />
                        </div>
                      )}

                      {job.status === 'completed' && (
                        <div className="text-sm text-gray-600">
                          <p>Completed: {job.endTime && new Date(job.endTime).toLocaleString()}</p>
                          <p>Records processed: {job.recordsProcessed}</p>
                        </div>
                      )}

                      {job.status === 'error' && job.errorMessage && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{job.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}