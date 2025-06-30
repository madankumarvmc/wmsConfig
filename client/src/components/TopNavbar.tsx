import { Button } from '@/components/ui/button';
import { User, Save, X } from 'lucide-react';
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
    <nav className="bg-black text-white px-6 py-3 flex items-center justify-between border-b border-gray-800">
      {/* Left side - Logo/Title and Navigation */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-medium">SBX WMS Setup</div>
          <div className="text-sm text-gray-300">Outbound Module Configuration</div>
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
                className={`border-gray-600 text-white hover:bg-gray-600 ${
                  button.active ? 'bg-gray-600' : 'bg-gray-700'
                }`}
              >
                {button.icon}
                <span className="ml-2">{button.label}</span>
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
            variant="outline"
            size="sm"
            onClick={button.onClick}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            {button.icon}
            <span className="ml-2">{button.label}</span>
          </Button>
        ))}
        
        {/* Default buttons for configuration pages */}
        {leftButtons.length === 0 && rightButtons.length === 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              onClick={handleExitSetup}
            >
              <X className="w-4 h-4 mr-2" />
              Exit Setup
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <User className="w-4 h-4 mr-2" />
              Admin User
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}