# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with frontend and backend
- `npm run build` - Build both frontend (Vite) and backend (esbuild)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking

## Architecture Overview

This is a full-stack warehouse management system (WMS) configuration portal with the following key components:

### Frontend Stack
- **React 18** + **TypeScript** for type-safe development  
- **Vite** for fast development and building
- **Wouter** for lightweight routing (not React Router)
- **TailwindCSS** + **shadcn/ui** for consistent UI components
- **TanStack Query** for server state management and caching
- **React Hook Form** + **Zod** for form validation

### Backend Stack
- **Express.js** server with TypeScript
- **In-Memory Storage** using JavaScript Maps for fast data operations
- **MemStorage Class** implements the storage interface with volatile data persistence
- RESTful API design with proper error handling middleware

### Project Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── MainSidebar.tsx # Primary navigation
├── pages/              # Route components
│   ├── master/         # Master configuration pages
│   └── steps/          # Outbound wizard steps (Step1-Step6)
├── contexts/           # React contexts (WizardContext)
├── types/              # TypeScript type definitions
└── lib/                # Utilities, mock data, query client

server/
├── index.ts            # Express server setup
├── routes.ts           # API route definitions
└── storage.ts          # In-memory storage implementation

shared/
└── schema.ts           # TypeScript interfaces and Zod validation schemas
```

## Key Concepts

### Wizard Flow Architecture
- **Multi-step configuration**: 6-step outbound configuration wizard
- **Step persistence**: Each step saves data to in-memory storage
- **Navigation state**: WizardContext manages current step and completion status
- **Data validation**: Zod schemas validate form data before submission

### In-Memory Storage Design
- **Primary data structures**: `users`, `wizard_configurations`, `task_sequence_configurations`, `inventory_groups`
- **Configuration storage**: Separate Maps for pick strategies, HU formation, stock allocation
- **Mock user**: Development uses userId=1 for all operations
- **Type safety**: TypeScript interfaces with Zod runtime validation

### Component Patterns
- **Layout components**: `WizardLayout` for wizard steps, `MainLayout` for master pages
- **Form components**: React Hook Form with Zod validation schemas
- **UI consistency**: All components use shadcn/ui and follow Tailwind design system
- **Query patterns**: TanStack Query for all server communication with proper cache management

### Development Environment
- **Port 5000**: Single server serves both API (`/api/*`) and frontend assets
- **Hot reload**: Vite provides instant feedback during development  
- **API logging**: Express middleware logs all API requests with response data
- **Error boundaries**: Development error overlays for runtime issues

## Important Notes

- The application uses a **6-step wizard flow** for outbound configuration
- **Step numbering**: Steps are numbered 1-6, accessible via `/step/1` through `/step/6`
- **Master configuration**: Separate section with provisioning, uploads, and templates
- **Mock data**: Extensive mock data in `lib/mockData.ts` and `lib/defaultConfigurations.ts`
- **No authentication**: Currently uses mock user (ID: 1) for all operations
- **In-memory first**: All configuration changes persist to volatile storage for development efficiency