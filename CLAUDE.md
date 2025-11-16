# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ML Data Augmentation System - Frontend: Next.js 15 application built for machine learning data augmentation and management, specifically designed for university student matching profile data with Test and Learning datasets.

## Tech Stack

- **Next.js 16.0.0** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library built on Radix UI
- **TanStack Query 5.90.5** - Server state management and data fetching
- **TanStack Table 8.21.3** - Table component for data display
- **Zustand 5.0.8** - Client state management
- **Axios 1.12.2** - HTTP client with interceptors
- **Biome 2.2.0** - Linting and formatting
- **Vitest** - Testing framework

## Development Commands

```bash
# Development
npm run dev                 # Start development server on 0.0.0.0:3000

# Building
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run lint               # Run Biome linter
npm run format             # Format code with Biome

# Testing
npm run test               # Run tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

## Project Architecture

### Directory Structure

```
ml-frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Dashboard/home page
│   ├── globals.css         # Global styles
│   └── datasets/           # Dataset management pages
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── dataset-stats-card.tsx
│   ├── task-progress-bar.tsx
│   ├── profile-filters.tsx
│   ├── profile-table.tsx
│   └── export-dialog.tsx
├── lib/                    # Utilities and configuration
│   ├── api-client.ts      # Axios instance with interceptors
│   ├── query-client.ts     # TanStack Query configuration
│   ├── utils.ts            # Helper utilities
│   └── api/                # API service modules
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

### Key Architecture Patterns

1. **API Integration**: Centralized API client with interceptors for logging and error handling
2. **Data Fetching**: TanStack Query for server state with proper caching and invalidation
3. **Component Architecture**: shadcn/ui components with Radix UI primitives
4. **State Management**: Zustand for client state, TanStack Query for server state
5. **Type Safety**: Comprehensive TypeScript types in `types/api.ts`

### API Client Configuration

The API client (`lib/api-client.ts`) is configured with:
- Base URL from `NEXT_PUBLIC_API_URL` (defaults to localhost:8000)
- 30-second timeout
- Request/response logging interceptors
- JSON content-type headers

### Data Models

Key types defined in `types/api.ts`:
- `ProfileData` - User profile structure with images, preferences, and matches
- `DatasetStats` - Dataset statistics with demographic distributions
- `TaskStatusResponse` - ML task progress tracking
- `ProfileFilters` - Search and filter parameters

## Development Guidelines

### Component Development
- Use shadcn/ui components as base building blocks
- Implement proper loading and error states for async operations
- Follow the existing component naming patterns (kebab-case for files)
- Use TypeScript interfaces for all props

### Data Fetching Patterns
- All API calls should use TanStack Query hooks
- Implement proper error handling with user-friendly messages
- Use optimistic updates where appropriate
- Implement proper caching strategies based on data volatility

### State Management
- Use Zustand for global client state (UI state, form state, etc.)
- Use TanStack Query for server state caching and synchronization
- Keep component state local when possible

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system with consistent spacing and colors
- Implement responsive design patterns
- Use `cn()` utility for conditional class merging

## Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001    # Backend API URL
```

## Testing

- Unit tests with Vitest
- Component testing with React Testing Library
- API mocking with MSW or similar
- Coverage reporting available via `npm run test:coverage`