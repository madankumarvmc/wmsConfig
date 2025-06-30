import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

export default function MasterUploads() {
  const uploadCategories = [
    {
      title: "Product Master Data",
      description: "Upload product information, SKUs, and inventory details",
      icon: <FileText className="w-6 h-6" />,
      acceptedFormats: ["CSV", "Excel", "JSON"],
      lastUpload: "2 days ago",
      status: "success"
    },
    {
      title: "Location Master Data", 
      description: "Upload warehouse locations, zones, and storage configurations",
      icon: <FileText className="w-6 h-6" />,
      acceptedFormats: ["CSV", "Excel"],
      lastUpload: "1 week ago", 
      status: "warning"
    },
    {
      title: "Customer Master Data",
      description: "Upload customer information and shipping preferences", 
      icon: <FileText className="w-6 h-6" />,
      acceptedFormats: ["CSV", "Excel", "JSON"],
      lastUpload: "Never",
      status: "pending"
    }
  ];

  const recentUploads = [
    {
      filename: "product_master_2025_06_30.csv",
      uploadTime: "2 hours ago",
      status: "success",
      records: 1250
    },
    {
      filename: "location_updates.xlsx", 
      uploadTime: "1 day ago",
      status: "success",
      records: 89
    },
    {
      filename: "inventory_adjustment.csv",
      uploadTime: "3 days ago", 
      status: "error",
      records: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Uploads</h1>
          <p className="text-gray-600">
            Upload and manage master data files for your warehouse management system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {uploadCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <div className={`p-2 rounded-lg mr-3 ${getStatusColor(category.status)}`}>
                    {category.icon}
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{category.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Accepted Formats</span>
                    <div className="flex gap-2 mt-1">
                      {category.acceptedFormats.map((format) => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Last Upload</span>
                    <p className="text-sm text-gray-700 mt-1">{category.lastUpload}</p>
                  </div>

                  <Button className="w-full bg-black hover:bg-gray-800 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.map((upload, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(upload.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{upload.filename}</h3>
                      <p className="text-sm text-gray-600">
                        {upload.uploadTime} • {upload.records > 0 ? `${upload.records} records` : 'Failed'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`capitalize ${
                      upload.status === 'success' ? 'border-green-200 text-green-700' :
                      upload.status === 'error' ? 'border-red-200 text-red-700' : 
                      'border-gray-200 text-gray-700'
                    }`}>
                      {upload.status}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}