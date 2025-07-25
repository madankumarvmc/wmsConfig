# WMS Pick Strategy Configuration Portal

## Overview

This is a full-stack web application built for configuring Warehouse Management System (WMS) pick strategies. The application provides a multi-step wizard interface that guides users through the configuration of task sequences, pick strategies, handling unit formation, work order management, and stock allocation strategies.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool and development server for fast compilation and hot module replacement
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with **shadcn/ui** components for consistent, modern UI design
- **TanStack Query** for efficient server state management and caching
- **React Hook Form** with Zod validation for type-safe form handling

### Backend Architecture
- **Express.js** server with TypeScript for API endpoints
- **In-Memory Storage** using JavaScript Maps for fast data operations and development
- **MemStorage Class** implements the storage interface with volatile data persistence
- **TypeScript Types** for schema validation using Zod instead of database schemas
- RESTful API design with proper error handling and logging middleware

### Data Storage Architecture
The application uses in-memory storage with the following data structures:
- **users**: Basic user authentication (currently using mock user for development)
- **wizard_configurations**: Stores step-by-step wizard progress and data
- **task_sequence_configurations**: Task sequence configurations with inventory group associations
- **inventory_groups**: Storage and line identifier combinations for task organization
- **stock_allocation_strategies**: PICK/PUT strategies linked to inventory groups
- **task_planning_configurations**: Planning strategies for task execution
- **task_execution_configurations**: Execution parameters linked to planning configurations
- **one_click_templates**: Pre-configured template data for quick setup

## Key Components

### Wizard Flow Management
- **WizardContext**: React context for managing wizard state across steps
- **WizardLayout**: Reusable layout component with navigation, header, and footer
- **StepNavigation**: Left sidebar navigation showing progress and allowing step jumping
- **Multi-step validation**: Each step validates data before allowing progression

### Data Management
- **Mock Data Integration**: Comprehensive mock data for dropdowns and selections
- **Form Validation**: Zod schemas for runtime type checking and validation
- **Persistent Storage**: Configurations saved to database with user association
- **Query Caching**: TanStack Query for optimized data fetching and state management

### UI Components
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Component Library**: shadcn/ui components for consistent design system
- **Toast Notifications**: User feedback for actions and errors

## Data Flow

1. **User Authentication**: Currently uses mock user (ID: 1) for development
2. **Wizard Navigation**: Users progress through 6 steps with state persistence
3. **Form Submission**: Each step validates and saves data to the database
4. **Configuration Management**: CRUD operations for task sequence configurations
5. **Real-time Updates**: TanStack Query manages cache invalidation and refetching

## External Dependencies

### Frontend Dependencies
- **@radix-ui**: Headless UI components for accessibility and functionality
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **class-variance-authority**: Utility for component variant styling
- **date-fns**: Date manipulation utilities
- **embla-carousel-react**: Carousel/slider functionality

### Backend Dependencies
- **zod**: Runtime type validation and schema parsing
- **TypeScript interfaces**: Type-safe data structures for in-memory storage
- **JavaScript Maps**: High-performance data storage with O(1) operations

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite provides instant feedback during development
- **Development Logging**: Express middleware logs API requests and responses
- **Error Boundaries**: Runtime error handling with development overlays

### Production Build
- **Vite Build**: Optimized frontend bundle with code splitting
- **esbuild**: Fast server-side bundling for production
- **Static Asset Serving**: Express serves built frontend assets
- **Environment Configuration**: Separate development and production configurations

### Data Management
- **In-Memory Storage**: Fast, volatile data storage using JavaScript Maps
- **Auto-incrementing IDs**: Each entity type has unique identifier generation
- **Type Safety**: TypeScript interfaces ensure data consistency across the application
- **Template System**: Pre-configured templates for quick warehouse setup

## Changelog

Changelog:
- July 25, 2025. Added CLAUDE.md file with comprehensive development guidance and architecture documentation
- July 25, 2025. Successfully merged updates from GitHub remote repository while preserving in-memory storage architecture
- July 22, 2025. Completed database removal and migration to in-memory storage with MemStorage class for development efficiency
- July 22, 2025. Cleaned up all deprecated API endpoints and files - removed drizzle.config.ts, PostgreSQL schemas, and unused route handlers
- July 22, 2025. Fixed all TypeScript errors and LSP diagnostics - application now runs cleanly with pure in-memory storage
- July 22, 2025. Updated schema.ts from Drizzle ORM to pure TypeScript interfaces with Zod validation for runtime type checking
- July 13, 2025. Fixed header positioning issues - prevented shifting when sidebar state changes by making top navbar fixed across full width
- July 13, 2025. Enhanced toggle switch visibility with better contrast (gray background for unchecked, black for checked states)
- July 13, 2025. Updated Review & Confirm page to reflect current 6-step workflow structure with proper step names and descriptions
- July 13, 2025. Completed one-click template system with Distribution Center template auto-applying comprehensive configurations
- July 13, 2025. Removed mandatory field requirements across all form schemas to enable smooth template application
- July 13, 2025. Added JSON export functionality for outbound configurations with comprehensive data export
- July 5, 2025. Added "Wave Planning" as new Step 2 in outbound configuration wizard
- July 5, 2025. Updated wizard structure from 7 to 8 steps with Wave Planning inserted after Inventory Groups
- July 5, 2025. Created comprehensive Wave Planning page with strategy configuration, templates, and automation settings
- July 5, 2025. Updated all subsequent step routing and navigation to accommodate new step numbering
- June 30, 2025. Successfully transformed portal into full warehouse configuration system with segregated sidebar navigation
- June 30, 2025. Implemented MainSidebar component with four distinct sections: Master Configuration, Outbound Configuration, Inbound Configuration, and Core Configuration
- June 30, 2025. Created comprehensive master configuration pages: Provisioning Setup (warehouse basic info), Master Uploads (data import/export), and One-Click Templates (industry templates)
- June 30, 2025. Replaced StepNavigation with expandable MainSidebar while preserving all existing outbound step functionality
- June 30, 2025. Added MainLayout component for master configuration pages with consistent navigation
- June 30, 2025. Updated routing to support master configuration paths (/master/*) alongside existing outbound steps (/step/*)
- June 30, 2025. Maintained design consistency with black/white/grey theme across all new pages
- June 30, 2025. Added expandable sections in sidebar with proper active state highlighting and step badges for outbound configuration
- June 30, 2025. Implemented "Coming Soon" placeholders for Inbound and Core Configuration sections
- June 29, 2025. Added "Inventory Groups" as new Step 1 to define SI/LI combinations that are referenced throughout wizard
- June 29, 2025. Major architectural change: Removed SI/LI forms from individual steps, now use inventory group selections
- June 29, 2025. Updated wizard structure from 5 to 6 steps with proper step numbering and navigation
- June 19, 2025. Completed one-click Quick Setup feature based on real warehouse JSON structure
- June 19, 2025. Fixed HU Formation and Work Order Management save button issues
- June 19, 2025. Implemented Step 5 Stock Allocation with three-panel interface and automatic PICK/PUT strategy creation
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.