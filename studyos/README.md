# StudyOS - Student Productivity Platform

A modern, production-quality student productivity platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard** - Overview with greeting, progress stats, tasks, focus timer, and recent notes
- **Tasks & Assignments** - Full CRUD with priorities, due dates, course linking, and filtering
- **Notes** - Rich text, markdown, and checklist support with folders, tags, and pinning
- **Study Planner** - Day/week/month calendar views with event scheduling
- **Focus Timer** - Pomodoro timer with customizable durations, session tracking, and statistics
- **Analytics** - Interactive charts for focus time, sessions, course breakdown, and productivity metrics
- **Global Search** - Search across tasks, notes, events, and courses with filters
- **Settings** - Theme, focus timer config, notifications, data export/import
- **Dark/Light Mode** - System-aware with manual override
- **Persistent Storage** - All data stored locally in IndexedDB
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessible** - ARIA labels, keyboard navigation, focus management

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **Zustand** for state management
- **IndexedDB (via idb)** for persistent local storage
- **React Router** for navigation
- **Recharts** for analytics visualizations
- **Lucide React** for icons
- **date-fns** for date utilities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn

### Installation

```bash
# Navigate to project directory
cd studyos

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card, Modal, etc.)
│   ├── layout/          # App shell, sidebar, header
│   ├── dashboard/       # Dashboard components
│   ├── tasks/           # Tasks page
│   ├── notes/           # Notes page
│   ├── planner/         # Planner/calendar page
│   ├── focus/           # Focus timer page
│   ├── analytics/       # Analytics page
│   ├── search/          # Search page
│   └── settings/        # Settings page
├── hooks/               # Custom React hooks
├── store/               # Zustand store with persistence
├── services/            # IndexedDB storage service
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles and Tailwind config
```

## Key Features Implementation

### Data Persistence
All data is stored locally in IndexedDB using the `idb` library. The storage service (`src/services/storage.ts`) provides a clean API for CRUD operations on all entities.

### State Management
Zustand store (`src/store/index.ts`) manages all application state with automatic persistence of preferences to localStorage.

### Theme System
- Three modes: Light, Dark, System
- System mode respects OS preference
- Smooth transitions between themes
- Persisted to localStorage

### Focus Timer
- Configurable Pomodoro durations
- Auto-start breaks/work sessions
- Sound notifications
- Session history tracking
- Circular progress visualization

### Analytics
- Weekly focus time area chart
- Daily activity bar chart
- Course breakdown pie chart
- Task status pie chart
- Priority breakdown
- Productivity score with streak tracking

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## Keyboard Shortcuts

- `⌘K` - Open global search
- `Space` - Play/pause focus timer (when focused)
- `Esc` - Close modals and dropdowns

## Data Export/Import

Settings page allows exporting all data as JSON and importing from backup files.

## License

MIT