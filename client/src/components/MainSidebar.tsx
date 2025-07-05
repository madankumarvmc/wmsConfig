import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings, 
  Upload, 
  FileText, 
  Package, 
  Image, 
  List, 
  RotateCcw, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  Lock,
  Waves,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [expandedSections, setExpandedSections] = useState<string[]>(['Master Configuration', 'Outbound Configuration']);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const sections: SidebarSection[] = [
    {
      title: 'Master Configuration',
      items: [
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Provisioning Setup',
          path: '/master/provisioning',
          isActive: currentPath === '/master/provisioning'
        },
        {
          icon: <Upload className="w-4 h-4" />,
          label: 'Master Uploads',
          path: '/master/uploads',
          isActive: currentPath === '/master/uploads'
        },
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'One-Click Templates',
          path: '/master/templates',
          isActive: currentPath === '/master/templates'
        }
      ]
    },
    {
      title: 'Outbound Configuration',
      items: [
        {
          icon: <Package className="w-4 h-4" />,
          label: 'Inventory Groups',
          path: '/step/1',
          badge: '1',
          isActive: currentPath === '/step/1'
        },
        {
          icon: <List className="w-4 h-4" />,
          label: 'Task Sequences',
          path: '/step/2',
          badge: '2',
          isActive: currentPath === '/step/2'
        },
        {
          icon: <Image className="w-4 h-4" />,
          label: 'Pick Strategies',
          path: '/step/3',
          badge: '3',
          isActive: currentPath === '/step/3'
        },
        {
          icon: <Package className="w-4 h-4" />,
          label: 'HU Formation',
          path: '/step/4',
          badge: '4',
          isActive: currentPath === '/step/4'
        },
        {
          icon: <RotateCcw className="w-4 h-4" />,
          label: 'Work Order Management',
          path: '/step/5',
          badge: '5',
          isActive: currentPath === '/step/5'
        },
        {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Stock Allocation',
          path: '/step/6',
          badge: '6',
          isActive: currentPath === '/step/6'
        }
      ]
    },
    {
      title: 'Inbound Configuration',
      items: [
        {
          icon: <Lock className="w-4 h-4" />,
          label: 'Coming Soon',
          path: '#',
          disabled: true
        }
      ]
    },
    {
      title: 'Core Configuration',
      items: [
        {
          icon: <Lock className="w-4 h-4" />,
          label: 'Coming Soon',
          path: '#',
          disabled: true
        }
      ]
    }
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (!item.disabled && item.path !== '#') {
      setLocation(item.path);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.includes(section.title);
          const isComingSoon = section.items.every(item => item.disabled);
          
          return (
            <div key={section.title} className="mb-6">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                disabled={isComingSoon}
              >
                <h3 className={`text-sm font-medium uppercase tracking-wide ${
                  isComingSoon ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {section.title}
                </h3>
                {!isComingSoon && (
                  isExpanded ? 
                    <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Section Items */}
              {isExpanded && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        item.isActive
                          ? 'bg-black text-white'
                          : item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${
                          item.isActive ? 'text-white' : 
                          item.disabled ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          item.isActive 
                            ? 'bg-white text-black' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}