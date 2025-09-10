import { useState, useRef, useEffect } from 'react';
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
  Download,
  Scissors,
  GitBranch,
  Cog,
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function MainSidebar({ currentPath, isMobileOpen = false, onMobileClose }: MainSidebarProps) {
  const [location, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Master Configuration', 'Outbound Configuration', 'Outbound Configuration V0.5']);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Use the actual location from the hook for consistency
  const activePath = location;

  // Check for mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Handle escape key for mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, onMobileClose]);

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
          label: 'Material Groups',
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
      title: 'Outbound Configuration V0.5',
      items: [
        {
          icon: <Scissors className="w-4 h-4" />,
          label: 'Line Split',
          path: '/outbound/v0.5/line-split',
          isActive: activePath === '/outbound/v0.5/line-split'
        },
        {
          icon: <GitBranch className="w-4 h-4" />,
          label: 'Task Sequence',
          path: '/outbound/v0.5/task-sequence',
          isActive: activePath === '/outbound/v0.5/task-sequence'
        },
        {
          icon: <Cog className="w-4 h-4" />,
          label: 'Task Strategy',
          path: '/outbound/v0.5/task-strategy',
          isActive: activePath === '/outbound/v0.5/task-strategy'
        },
        {
          icon: <Search className="w-4 h-4" />,
          label: 'Bin Search',
          path: '/outbound/v0.5/bin-search',
          isActive: activePath === '/outbound/v0.5/bin-search'
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

  // Preload component on hover
  const handleItemHover = (path: string) => {
    const preloadMap: Record<string, () => Promise<any>> = {
      '/step/1': () => import('@/pages/steps/Step1InventoryGroups'),
      '/step/2': () => import('@/pages/steps/Step2WavePlanning'),
      '/step/3': () => import('@/pages/steps/Step3TaskSequences'),
      '/step/4': () => import('@/pages/steps/Step4TaskPlanning'),
      '/step/5': () => import('@/pages/steps/Step5TaskExecution'),
      '/step/6': () => import('@/pages/steps/Step6ReviewConfirm'),
      '/master/provisioning': () => import('@/pages/master/ProvisioningSetup'),
      '/master/uploads': () => import('@/pages/master/MasterUploads'),
      '/master/templates': () => import('@/pages/master/OneClickTemplates'),
      '/outbound/v0.5/line-split': () => import('@/pages/outbound-v05/LineSplitV05'),
      '/outbound/v0.5/task-sequence': () => import('@/pages/outbound-v05/TaskSequenceV05'),
      '/outbound/v0.5/task-strategy': () => import('@/pages/outbound-v05/TaskStrategyV05'),
      '/outbound/v0.5/bin-search': () => import('@/pages/outbound-v05/BinSearchV05'),
    };

    const preloader = preloadMap[path];
    if (preloader) {
      preloader().catch(() => {}); // Silently handle preload errors
    }
  };

  const handleItemClick = (item: SidebarItem) => {
    if (!item.disabled && item.path !== '#') {
      // Store current scroll position before navigation
      const currentScrollTop = sidebarRef.current?.scrollTop || 0;
      setLocation(item.path);
      
      // Close mobile sidebar after navigation
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
      
      // Restore scroll position after a short delay to ensure DOM updates
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.scrollTop = currentScrollTop;
        }
      }, 50);
    }
  };

  // On mobile, only render if opened or if we're on desktop
  if (isMobile && !isMobileOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef} 
        className={cn(
          "bg-white border-r border-gray-200 h-screen overflow-y-auto",
          // Mobile styles
          isMobile && "fixed top-0 left-0 z-50 w-80",
          // Desktop styles  
          !isMobile && `${isCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300`
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header with close button for mobile */}
        <div className="flex justify-between items-center p-2 border-b border-gray-100">
          {!isCollapsed && (
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Modules</span>
          )}
          
          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileClose}
              className="w-8 h-8 p-0 hover:bg-gray-100 md:hidden"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          
          {/* Desktop collapse button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 p-0 hover:bg-gray-100"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          )}
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
                aria-expanded={isExpanded}
                aria-controls={`section-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title} section`}
              >
                <h3 className={`text-sm font-medium uppercase tracking-wide ${
                  isComingSoon ? 'text-gray-400' : 'text-gray-600'
                } ${isCollapsed ? 'hidden' : ''}`}>
                  {section.title}
                </h3>
                {isCollapsed && (
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center" aria-hidden="true">
                    <div className="w-2 h-2 bg-gray-600 rounded"></div>
                  </div>
                )}
                {!isComingSoon && (
                  isExpanded ? 
                    <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                )}
              </button>

              {/* Section Items */}
              {(isExpanded || isCollapsed) && (
                <div 
                  className="mt-2 space-y-1"
                  id={`section-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
                  role="group"
                  aria-labelledby={`section-header-${section.title.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {section.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => handleItemHover(item.path)}
                      disabled={item.disabled}
                      title={isCollapsed ? item.label : undefined}
                      aria-label={item.label}
                      aria-current={item.isActive ? 'page' : undefined}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center relative' : 'justify-between'} p-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                  

                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}