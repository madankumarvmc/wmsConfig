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
  Lock
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
}

export default function MainSidebar({ currentPath }: MainSidebarProps) {
  const [, setLocation] = useLocation();

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
          icon: <Split className="w-5 h-5" />,
          label: "Line-Split Strategies", 
          path: "/step2"
        },
        {
          icon: <List className="w-5 h-5" />,
          label: "Task Sequences",
          path: "/step3"
        },
        {
          icon: <RefreshCw className="w-5 h-5" />,
          label: "Replenishment Control",
          path: "/step4"
        },
        {
          icon: <CheckCircle2 className="w-5 h-5" />,
          label: "Review & Publish",
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
                const isActive = currentPath === item.path || 
                  (currentPath?.startsWith('/step') && item.path.startsWith('/step'));
                
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