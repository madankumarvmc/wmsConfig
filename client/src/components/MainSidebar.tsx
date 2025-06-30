import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings2, 
  Upload, 
  FileText, 
  Package, 
  Split, 
  List, 
  RefreshCw, 
  CheckCircle2,
  Lock,
  Truck,
  ClipboardList,
  Database
} from 'lucide-react';
import { useLocation } from 'wouter';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
  disabled?: boolean;
  isActive?: boolean;
}

interface MainSidebarProps {
  currentPath?: string;
  currentStep?: number;
}

export default function MainSidebar({ currentPath, currentStep }: MainSidebarProps) {
  const [, setLocation] = useLocation();

  // Check if we're in the outbound configuration flow
  const isOutboundFlow = currentPath?.startsWith('/step');

  const sections: SidebarSection[] = [
    {
      title: "MASTER CONFIGURATION",
      items: [
        {
          icon: <Settings2 className="w-5 h-5" />,
          label: "Provisioning Setup",
          path: "/master/provisioning",
          badge: "Active"
        },
        {
          icon: <Upload className="w-5 h-5" />,
          label: "Master Uploads",
          path: "/master/uploads"
        },
        {
          icon: <FileText className="w-5 h-5" />,
          label: "One-Click Templates",
          path: "/master/templates"
        }
      ]
    },
    {
      title: "OUTBOUND CONFIGURATION", 
      items: [
        {
          icon: <Package className="w-5 h-5" />,
          label: "Inventory Groups",
          path: "/step1"
        },
        {
          icon: <List className="w-5 h-5" />,
          label: "Task Sequences", 
          path: "/step2"
        },
        {
          icon: <Truck className="w-5 h-5" />,
          label: "Pick Strategies",
          path: "/step3"
        },
        {
          icon: <ClipboardList className="w-5 h-5" />,
          label: "HU Formation",
          path: "/step4"
        },
        {
          icon: <Database className="w-5 h-5" />,
          label: "Work Orders",
          path: "/step5"
        },
        {
          icon: <Database className="w-5 h-5" />,
          label: "Stock Allocation",
          path: "/step6"
        }
      ]
    },
    {
      title: "INBOUND CONFIGURATION",
      items: [
        {
          icon: <Lock className="w-5 h-5 text-gray-400" />,
          label: "Coming Soon",
          path: "/inbound",
          disabled: true
        }
      ]
    },
    {
      title: "CORE CONFIGURATION", 
      items: [
        {
          icon: <Lock className="w-5 h-5 text-gray-400" />,
          label: "Coming Soon",
          path: "/core",
          disabled: true
        }
      ]
    }
  ];

  const handleNavigation = (path: string, disabled?: boolean) => {
    if (!disabled) {
      setLocation(path);
    }
  };

  // If we're in outbound flow, show only outbound configuration with step numbers
  if (isOutboundFlow) {
    const outboundSection = sections.find(s => s.title === "OUTBOUND CONFIGURATION");
    if (!outboundSection) return null;

    return (
      <div className="w-80 bg-gray-100 border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900">SBX WMS Setup</h1>
          <p className="text-sm text-gray-600 mt-1">Outbound Module Configuration</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {outboundSection.items.map((item, index) => {
              const stepNumber = index + 1;
              const isActive = currentPath === item.path;
              const isCompleted = currentStep ? stepNumber < currentStep : false;
              
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path, item.disabled)}
                  className={`flex items-center p-3 rounded-lg w-full text-left transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : isCompleted
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                  disabled={item.disabled}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">
                      Step {stepNumber} of {outboundSection.items.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show full sidebar for master configuration and other sections
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {section.title}
            </h3>
            
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = currentPath === item.path;
                
                return (
                  <Button
                    key={itemIndex}
                    variant="ghost"
                    className={`w-full justify-start px-3 py-3 h-auto text-left ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                        : item.disabled 
                          ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleNavigation(item.path, item.disabled)}
                    disabled={item.disabled}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 bg-blue-100 text-blue-700 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}