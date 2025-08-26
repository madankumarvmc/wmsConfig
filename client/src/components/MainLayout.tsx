import { ReactNode, useState } from 'react';
import TopNavbar from './TopNavbar';
import MainSidebar from './MainSidebar';
import JsonPayloadSidebar from './JsonPayloadSidebar';
import { useLocation } from 'wouter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navbar - Fixed across full width */}
      <div className="flex-shrink-0 fixed top-0 left-0 right-0 z-40">
        <TopNavbar onMenuClick={handleOpenMobileSidebar} />
      </div>
      
      {/* Content area with sidebar and main content */}
      <div className="flex flex-1 pt-[72px] overflow-hidden">
        {/* Single sidebar that handles both desktop and mobile */}
        <MainSidebar 
          currentPath={location}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleCloseMobileSidebar}
        />
        
        {/* Main Content - Scrollable independently */}
        <main 
          className="flex-1 p-4 md:p-6 overflow-y-auto"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
      </div>
      
      {/* JSON Payload Sidebar - Fixed floating trigger button */}
      <JsonPayloadSidebar />
    </div>
  );
}