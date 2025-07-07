import { Button } from '@/components/ui/button';
import { X, Save, User } from 'lucide-react';
import { useLocation } from 'wouter';

interface TopNavbarButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface TopNavbarProps {
  leftButtons?: TopNavbarButton[];
  rightButtons?: TopNavbarButton[];
}

export default function TopNavbar({ leftButtons = [], rightButtons = [] }: TopNavbarProps) {
  const [, setLocation] = useLocation();

  const handleExitSetup = () => {
    setLocation('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-title-20 text-gray-900">SBX WMS Setup</div>
            <div className="text-body-14 text-gray-500">Warehouse Configuration Portal</div>
          </div>
          
          {/* Left navigation buttons */}
          {leftButtons.length > 0 && (
            <div className="flex items-center space-x-2">
              {leftButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={button.onClick}
                  className={`border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 ${
                    button.active ? 'bg-blue-100 text-blue-700 border-blue-400' : ''
                  }`}
                >
                  {button.icon}
                  <span className="ml-2 text-body-14">{button.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-3">
          {rightButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.active ? "default" : "outline"}
              size="sm"
              onClick={button.onClick}
              className={button.active 
                ? "wms-button-primary" 
                : "border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              }
            >
              {button.icon}
              <span className="ml-2 text-body-14">{button.label}</span>
            </Button>
          ))}
          
          {/* Default buttons for configuration pages */}
          {leftButtons.length === 0 && rightButtons.length === 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                onClick={handleExitSetup}
              >
                <X className="w-4 h-4 mr-2" />
                Exit Setup
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400"
              >
                <User className="w-4 h-4 mr-2" />
                Admin User
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}