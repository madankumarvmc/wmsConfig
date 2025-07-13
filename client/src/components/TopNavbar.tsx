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
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
              <div className="text-white font-bold text-sm">SBX</div>
            </div>
            <div className="text-title-20 text-white">SBX Warehouse Configuration Portal</div>
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
                  className={`border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 ${
                    button.active ? 'bg-slate-700 text-white border-slate-500' : ''
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
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
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
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                onClick={handleExitSetup}
              >
                <X className="w-4 h-4 mr-2" />
                Exit Setup
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
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