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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <MainSidebar currentPath={location} />
        
        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}