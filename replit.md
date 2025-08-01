# Overview

This is a web-based game application called "ABC-Slayer" built with a modern full-stack architecture. The frontend is a React-based game client featuring a custom canvas-based 2D game engine, while the backend is an Express.js server with PostgreSQL database support via Drizzle ORM. The game appears to be a survival-style game where players control a character that automatically engages enemies.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (January 2025)

## Game Title Change
- Renamed from "Auto-Slayer" to "ABC-Slayer" per user request

## UI and UX Improvements (February 1, 2025)
- **Critical Tutorial Bug Fix**: Removed problematic `inputManager.getLastPressedKey` debug code causing JavaScript errors
- **Complete UI Synchronization**: Achieved full feature parity between tutorial and infinite modes:
  - **Card-style Level-up Menu**: Replaced list-style with modern card layout matching infinite mode
  - **Color-coded Item System**: Steel blue (weapons), orange (upgrades), lime green (passives), gold (special items)
  - **Enhanced Experience Gems**: Optimized colors for dark navy background (cyan→hot pink→spring green)
  - **Weapon Inventory Display**: Added bottom-right weapon slots showing levels, names, and stats
  - **Unified Input Handling**: Both card clicks and keyboard shortcuts (1-4) work consistently
- **Tutorial Map Redesign**: Replaced brown battlefield with clean dark navy arena featuring:
  - **High Contrast Background**: Dark navy (#1A1A2E) base for better object visibility
  - **Subtle Grid Pattern**: 100px grid lines for spatial awareness without distraction
  - **Arena Lighting**: Radial gradient with blue tones for professional tournament feel
  - **Corner Markers**: Blue corner indicators defining play area boundaries
- **Sacred Ground Balance**: Reduced weapon power for better gameplay flow:
  - **Damage Reduction**: Initial damage 8→3, max level damage 25→10
  - **Hit Frequency**: Increased cooldown from 0.33s to 2.0s for less overwhelming DPS
  - **Gradual Progression**: Smoother damage scaling across weapon levels
- **Revolutionary Character Design**: Completely transformed player and enemy visuals:
  - **Player**: Crystalline energy being with health-based aura, energy particles, and movement trails
  - **Enemy A**: Demonic swift attacker with flame effects, organic shape, horns, and speed trails
  - **Enemy B**: Mechanical armored golem with hexagonal design, steam vents, and warning lights
  - **Enemy C**: Bio-mechanical spider with electrical discharge, organic tentacles, and multiple eyes
  - **Dynamic Effects**: All entities feature animation, pulsing, and contextual visual feedback

## Gameplay Balance Improvements (January 31, 2025)
- Sacred Ground weapon damage interval increased from 1.0 to 2.0 seconds for better enemy movement flow
- Enemy health significantly increased for better damage balance:
  - Slime: 10→25 HP
  - Bat: 8→20 HP
  - Skeleton Soldier: 40→60 HP
  - Goblin Shaman: 30→50 HP
  - Ogre: 500→800 HP
- Fixed weapon selection system and mouse targeting for proper functionality

## Tutorial Mode Implementation
- Added new TutorialScene with 5-minute time limit and boss battle
- Main menu redesigned with two buttons: "튜토리얼" and "무한 모드"
- Tutorial features reduced enemy spawning, boss at 4:30, victory condition on boss defeat
- Clear win/lose conditions with automatic return to main menu

## UI Layout Improvements
- Moved experience bar to very top of screen (full width, visual progress only)
- Moved character status display down to avoid overlap with experience bar
- Experience bar shows only progress visualization for user estimation

## Experience System Adjustments
- Experience now only obtainable from gems (removed hit-based experience)
- Increased experience gem values: Yellow=25xp, Purple=50xp, Blue=100xp (previously 10/25/50)
- Increased gem collection speed from 200 to 600 for faster pickup

## Combat Balance Improvements
- Increased bullet size from 6x6 to 10x10 pixels for better hit rates
- Increased enemy sizes: Slime 28→35px, Bat 24x20→30x26px, Skeleton 30x36→36x42px
- Applied bullet hell design principles: generous player offense, better hit detection

## Level-up System Fixes
- Added detailed logging for weapon upgrades and passive applications
- Fixed weapon levelUp method calls for proper upgrade progression
- Enhanced reward selection debugging for better user feedback

## Weapon System Overhaul
- Players now start with only Magic Orb weapon (removed auto-equipped weapons)
- All other weapons (Shuriken, Sacred Ground, etc.) must be acquired through level-up choices
- Level-up system properly offers new weapons as options for strategic progression

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system using CSS variables for theming
- **UI Components**: Comprehensive component library using Radix UI primitives with custom styling
- **State Management**: Zustand for lightweight state management with stores for game state and audio controls
- **Data Fetching**: TanStack Query for server state management with custom query client configuration
- **Game Engine**: Custom canvas-based 2D game engine with scene management system

## Game Engine Design
- **Scene System**: Modular scene-based architecture (PreloadScene, MainMenuScene, GameScene, UIScene)
- **Entity System**: Object-oriented entities (Player, Enemy) with update/render loops
- **Manager Pattern**: Separate managers for Input, Audio, and game utilities
- **Game Loop**: RequestAnimationFrame-based game loop with delta time calculations
- **Asset Loading**: Asynchronous asset preloading system for audio and visual resources

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage Pattern**: Abstracted storage interface supporting both memory and database implementations
- **Middleware**: Custom logging middleware for API request tracking
- **Development**: Vite integration for hot module replacement in development

## Build and Development
- **Module System**: ESNext modules throughout the stack
- **Development Server**: Vite dev server with HMR and runtime error overlay
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Strict TypeScript configuration with shared types between client and server

## Database Schema
- **User Management**: Basic user system with username/password authentication
- **Type Safety**: Drizzle-Zod integration for runtime schema validation
- **Migrations**: Drizzle Kit for database schema management

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **express**: Web application framework for the backend API
- **react**: Frontend UI library with TypeScript support
- **vite**: Build tool and development server

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for components
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **@fontsource/inter**: Self-hosted Inter font family
- **lucide-react**: Icon library for consistent iconography

## Game Development
- **@react-three/drei**: React Three.js utilities (included but not actively used)
- **@react-three/fiber**: React renderer for Three.js (included but not actively used)
- **vite-plugin-glsl**: GLSL shader support for future 3D features

## State Management and Data
- **zustand**: Lightweight state management solution
- **@tanstack/react-query**: Server state management and caching
- **zod**: Runtime type validation and schema definition

## Development Tools
- **drizzle-kit**: Database migration and schema management tool
- **tsx**: TypeScript execution environment for development
- **@replit/vite-plugin-runtime-error-modal**: Development error handling