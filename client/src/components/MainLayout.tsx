import { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import MainSidebar from './MainSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      
      <div className="flex flex-1">
        <MainSidebar />
        
        <div className="flex-1">
          <main className="h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}