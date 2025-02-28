# CLAUDE.md - Open Deep Research Codebase Guide

## Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build the project
- `npm run start`: Start production server  
- Run single test: `node --test lib/deep-research/ai/text-splitter.test.ts`
- Lint: Not explicitly defined in package.json (recommend adding ESLint)
- Type check: TypeScript is used but no dedicated typecheck script

## Code Style Guidelines

### Imports & Structure
- Use path alias `@/` for imports (e.g., `import { Component } from '@/components/ui'`)
- Group imports: React/Next first, external libraries, then internal modules
- Destructure imports where appropriate

### Component Structure
- 'use client' directive at top of client components 
- React functional components with explicit TypeScript interfaces for props
- Define props interfaces inline with component definition
- Use motion components from framer-motion for animations

### TypeScript Usage
- Strict TypeScript mode enabled
- Explicit typing for state variables, function params and returns
- Use interfaces for component props and complex data structures

### Error Handling
- Use try/catch blocks with specific error messages
- Log errors to console with context (`console.error("Error context:", error)`)
- Provide user-friendly error feedback in UI
- Handle API response errors gracefully

### Naming & Style
- PascalCase for component names, interfaces, and types
- camelCase for variables, functions, and instances
- Semantic, descriptive names
- Clear state variable names with boolean prefixes like 'is' for flags

### State Management
- React hooks for local state (`useState`, `useEffect`)
- Props for component communication
- Custom hooks for reusable logic (e.g., `useScrollToBottom`)
- State updates with functional form for dependent states