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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Fixed with its own scroll */}
      <MainSidebar currentPath={location} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar - Fixed */}
        <div className="flex-shrink-0">
          <TopNavbar />
        </div>
        
        {/* Content - Scrollable independently */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}