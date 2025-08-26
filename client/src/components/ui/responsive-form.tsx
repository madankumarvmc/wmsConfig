import * as React from 'react';
import { cn } from '@/lib/utils';

const ResponsiveFormGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    columns?: 1 | 2 | 3 | 4;
  }
>(({ className, columns = 2, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid gap-4",
      {
        "grid-cols-1": columns === 1,
        "grid-cols-1 md:grid-cols-2": columns === 2,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
      },
      className
    )}
    {...props}
  />
));
ResponsiveFormGrid.displayName = "ResponsiveFormGrid";

const ResponsiveFormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
  }
>(({ className, title, description, collapsible = false, defaultOpen = true, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      ref={ref}
      className={cn(
        "space-y-4 p-4 md:p-6 border border-border rounded-lg bg-card",
        className
      )}
      {...props}
    >
      {title && (
        <div className="space-y-2">
          {collapsible ? (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full text-left"
              aria-expanded={isOpen}
              aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
              <div
                className={cn(
                  "h-4 w-4 transform transition-transform",
                  isOpen ? "rotate-180" : "rotate-0"
                )}
                aria-hidden="true"
              >
                ▼
              </div>
            </button>
          ) : (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      
      {(!collapsible || isOpen) && (
        <div
          id={title ? `section-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
          className="space-y-4"
        >
          {children}
        </div>
      )}
    </div>
  );
});
ResponsiveFormSection.displayName = "ResponsiveFormSection";

const ResponsiveFormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    fullWidth?: boolean;
  }
>(({ className, label, description, error, required, fullWidth, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "space-y-2",
      fullWidth && "md:col-span-full",
      className
    )}
    {...props}
  >
    {label && (
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>
    )}
    {description && (
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    )}
    {children}
    {error && (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    )}
  </div>
));
ResponsiveFormField.displayName = "ResponsiveFormField";

const ResponsiveFormActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end' | 'between';
    stack?: boolean;
  }
>(({ className, align = 'end', stack = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-2",
      stack ? "flex-col sm:flex-row" : "flex-col sm:flex-row",
      {
        "justify-start": align === 'start',
        "justify-center": align === 'center', 
        "justify-end": align === 'end',
        "justify-between": align === 'between',
      },
      className
    )}
    {...props}
  />
));
ResponsiveFormActions.displayName = "ResponsiveFormActions";

const ResponsiveFormTabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tabs: { id: string; label: string; content: React.ReactNode }[];
    defaultTab?: string;
  }
>(({ className, tabs, defaultTab, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {/* Tab navigation */}
      <div 
        className="border-b border-border overflow-x-auto"
        role="tablist"
        aria-label="Form sections"
      >
        <div className="flex space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={cn(
                "whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          className={cn(
            "space-y-4",
            activeTab !== tab.id && "hidden"
          )}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
});
ResponsiveFormTabs.displayName = "ResponsiveFormTabs";

export {
  ResponsiveFormGrid,
  ResponsiveFormSection,
  ResponsiveFormField,
  ResponsiveFormActions,
  ResponsiveFormTabs,
};