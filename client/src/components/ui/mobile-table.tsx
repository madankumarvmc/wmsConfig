import * as React from 'react';
import { cn } from '@/lib/utils';

const MobileTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full overflow-auto",
      className
    )}
    {...props}
  />
));
MobileTable.displayName = "MobileTable";

const MobileTableHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "hidden md:flex bg-muted/50 font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
));
MobileTableHeader.displayName = "MobileTableHeader";

const MobileTableBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2 md:space-y-0", className)}
    {...props}
  />
));
MobileTableBody.displayName = "MobileTableBody";

const MobileTableRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    headers?: string[];
  }
>(({ className, children, headers = [], ...props }, ref) => {
  // Convert children to array for easier manipulation
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div
      ref={ref}
      className={cn(
        // Desktop: table row
        "md:flex md:border-b md:transition-colors md:hover:bg-muted/50",
        // Mobile: card layout
        "md:border-0 border border-border rounded-lg p-4 bg-card space-y-2 md:space-y-0 md:p-0 md:bg-transparent md:rounded-none shadow-sm md:shadow-none",
        className
      )}
      {...props}
    >
      {childrenArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            key: index,
            'data-label': headers[index],
            className: cn(
              child.props.className,
              // Mobile: stacked with labels
              "md:flex md:items-center",
              // Add mobile label styling
              "before:content-[attr(data-label)':'] before:font-medium before:text-muted-foreground before:block before:mb-1 md:before:hidden"
            ),
          });
        }
        return child;
      })}
    </div>
  );
});
MobileTableRow.displayName = "MobileTableRow";

const MobileTableHead = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 p-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
MobileTableHead.displayName = "MobileTableHead";

const MobileTableCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex-1 p-4 align-middle [&:has([role=checkbox])]:pr-0 md:border-0",
      // Mobile specific styling
      "md:p-4 p-0 md:flex md:items-center",
      className
    )}
    {...props}
  />
));
MobileTableCell.displayName = "MobileTableCell";

const MobileTableCaption = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
MobileTableCaption.displayName = "MobileTableCaption";

export {
  MobileTable,
  MobileTableHeader,
  MobileTableBody,
  MobileTableRow,
  MobileTableHead,
  MobileTableCell,
  MobileTableCaption,
};