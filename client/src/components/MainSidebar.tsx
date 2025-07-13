import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Settings, 
  Upload, 
  FileText, 
  Package, 
  Waves,
  List, 
  Target,
  Play, 
  BarChart3, 
  ChevronDown, 
  ChevronRight,
  Lock,
  ChevronLeft,
  Menu,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [location, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Master Configuration', 'Outbound Configuration']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { toast } = useToast();
  
  // Use the actual location from the hook for consistency
  const activePath = location;

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const handleExportOutboundConfig = async () => {
    try {
      const response = await fetch('/api/export/outbound');
      if (!response.ok) {
        throw new Error('Failed to export configuration');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `outbound-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: 'Outbound configuration exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export outbound configuration.',
        variant: 'destructive',
      });
    }
  };

  const sections: SidebarSection[] = [
    {
      title: 'Master Configuration',
      items: [
        {
          icon: <Settings className="w-4 h-4" />,
          label: 'Provisioning Setup',
          path: '/master/provisioning',
          isActive: activePath === '/master/provisioning'
        },
        {
          icon: <Upload className="w-4 h-4" />,
          label: 'Master Uploads',
          path: '/master/uploads',
          isActive: activePath === '/master/uploads'
        },
        {
          icon: <FileText className="w-4 h-4" />,
          label: 'One-Click Templates',
          path: '/master/templates',
          isActive: activePath === '/master/templates'
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
          isActive: activePath === '/step/1'
        },
        {
          icon: <Waves className="w-4 h-4" />,
          label: 'Wave Planning',
          path: '/step/2',
          badge: '2',
          isActive: activePath === '/step/2'
        },
        {
          icon: <List className="w-4 h-4" />,
          label: 'Task Sequences',
          path: '/step/3',
          badge: '3',
          isActive: activePath === '/step/3'
        },
        {
          icon: <Target className="w-4 h-4" />,
          label: 'Task Planning',
          path: '/step/4',
          badge: '4',
          isActive: activePath === '/step/4'
        },
        {
          icon: <Play className="w-4 h-4" />,
          label: 'Task Execution',
          path: '/step/5',
          badge: '5',
          isActive: activePath === '/step/5'
        },
        {
          icon: <BarChart3 className="w-4 h-4" />,
          label: 'Review & Confirm',
          path: '/step/6',
          badge: '6',
          isActive: activePath === '/step/6'
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
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 h-screen overflow-y-auto flex-shrink-0 transition-all duration-300`}>
      {/* Collapse/Expand Button */}
      <div className="flex justify-between items-center p-2 border-b border-gray-100">
        {!isCollapsed && (
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Modules</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 p-0 hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
      
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
                } ${isCollapsed ? 'hidden' : ''}`}>
                  {section.title}
                </h3>
                {isCollapsed && (
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-600 rounded"></div>
                  </div>
                )}
                {!isComingSoon && (
                  isExpanded ? 
                    <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Section Items */}
              {(isExpanded || isCollapsed) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center relative' : 'justify-between'} p-3 rounded-lg text-left transition-colors ${
                        item.isActive
                          ? 'bg-black text-white'
                          : item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className={`${
                          item.isActive ? 'text-white' : 
                          item.disabled ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {item.icon}
                        </div>
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                        {isCollapsed && item.badge && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium ${
                            item.isActive 
                              ? 'bg-white text-black' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {item.badge}
                          </div>
                        )}
                      </div>
                      {item.badge && !isCollapsed && (
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
                  
                  {/* Export button for Outbound Configuration */}
                  {section.title === 'Outbound Configuration' && !isCollapsed && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Button
                        onClick={handleExportOutboundConfig}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Export JSON</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}