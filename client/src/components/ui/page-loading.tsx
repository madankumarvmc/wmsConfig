import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'content' | 'inline';
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, variant = 'content', ...props }, ref) => {
    const variants = {
      full: 'min-h-screen flex items-center justify-center bg-gray-50',
      content: 'w-full min-h-full flex-1 p-6',
      inline: 'h-32 flex items-center justify-center'
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            {/* Page header skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-100 rounded w-96"></div>
            </div>
            
            {/* Content cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Table skeleton */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="h-4 bg-gray-100 rounded flex-1"></div>
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-4 bg-gray-100 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PageLoading.displayName = 'PageLoading';

export default PageLoading;