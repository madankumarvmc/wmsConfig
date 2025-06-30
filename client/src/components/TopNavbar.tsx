import { Button } from '@/components/ui/button';
import { User, Save, X } from 'lucide-react';
import { useLocation } from 'wouter';

export default function TopNavbar() {
  const [, setLocation] = useLocation();

  const handleExitSetup = () => {
    setLocation('/');
  };

  return (
    <header className="bg-black shadow-sm border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Brand */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-white">SBX WMS Setup</h1>
          <span className="ml-2 text-sm text-gray-300">Outbound Module Configuration</span>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="bg-gray-600 text-white border-gray-500 hover:bg-gray-500">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-600 text-white border-gray-500 hover:bg-gray-500"
            onClick={handleExitSetup}
          >
            <X className="w-4 h-4 mr-2" />
            Exit Setup
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <User className="w-4 h-4 mr-2" />
            Admin User
          </Button>
        </div>
      </div>
    </header>
  );
}