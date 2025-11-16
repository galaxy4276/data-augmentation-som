# ML Data Augmentation System - Frontend

Next.js 15 frontend application for the Machine Learning Data Augmentation and Management System.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **TanStack Query** - Data fetching and caching
- **TanStack Table** - Powerful table component
- **Zustand** - State management
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
ml-frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components (to be added)
├── lib/                   # Utility functions
│   ├── api-client.ts     # Axios instance with interceptors
│   ├── query-client.ts   # TanStack Query configuration
│   └── utils.ts          # Helper utilities
├── providers/            # React context providers
│   └── query-provider.tsx # TanStack Query provider
├── types/                # TypeScript type definitions
│   └── api.ts           # API response types
└── public/              # Static assets
```

## Features

- **Dashboard** - View dataset statistics and task progress
- **Dataset Management** - Browse, filter, and search profiles
- **Data Export** - Export datasets to CSV format
- **Real-time Updates** - Live task progress monitoring
- **Responsive Design** - Mobile-friendly interface

## API Integration

The frontend connects to the FastAPI backend at `NEXT_PUBLIC_API_URL`. The API client is configured with:

- 30-second timeout
- Request/response logging
- Error handling interceptors
- JSON content type headers

## Development Guidelines

- Use TypeScript for all new files
- Follow the existing component structure
- Use TanStack Query for all API calls
- Implement proper error handling
- Add loading states for async operations
- Use shadcn/ui components when possible

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome
