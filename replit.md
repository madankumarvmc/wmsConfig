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
- **Drizzle ORM** for type-safe database operations and schema management
- **PostgreSQL** database (configured via environment variables)
- **Neon Database** serverless connection for cloud-based PostgreSQL
- RESTful API design with proper error handling and logging middleware

### Database Schema
The application uses three main database tables:
- **users**: Basic user authentication (currently using mock user for development)
- **wizard_configurations**: Stores step-by-step wizard progress and data
- **task_sequence_configurations**: Stores complete task sequence configurations with storage identifiers, line identifiers, and task sequences

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
- **drizzle-orm**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store (for future session management)
- **drizzle-zod**: Integration between Drizzle and Zod for schema validation

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and schema management tools

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

### Database Management
- **Drizzle Migrations**: Version-controlled database schema changes
- **Environment Variables**: DATABASE_URL for flexible database configuration
- **Connection Pooling**: Neon serverless handles connection management

## Changelog

Changelog:
- June 29, 2025. Added "Inventory Groups" as new Step 1 to define SI/LI combinations that are referenced throughout wizard
- June 29, 2025. Major architectural change: Removed SI/LI forms from individual steps, now use inventory group selections
- June 29, 2025. Updated wizard structure from 5 to 6 steps with proper step numbering and navigation
- June 19, 2025. Completed one-click Quick Setup feature based on real warehouse JSON structure
- June 19, 2025. Fixed HU Formation and Work Order Management save button issues
- June 19, 2025. Implemented Step 5 Stock Allocation with three-panel interface and automatic PICK/PUT strategy creation
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.