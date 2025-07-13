import { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import MainSidebar from './MainSidebar';
import { useLocation } from 'wouter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Navbar - Fixed across full width */}
      <div className="flex-shrink-0 fixed top-0 left-0 right-0 z-50">
        <TopNavbar />
      </div>
      
      {/* Content area with sidebar and main content */}
      <div className="flex flex-1 pt-[72px] overflow-hidden">
        {/* Sidebar - Fixed with its own scroll */}
        <MainSidebar currentPath={location} />
        
        {/* Main Content - Scrollable independently */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}