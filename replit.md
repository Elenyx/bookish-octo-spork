# Stellar Nexus - Space Exploration Game

## Overview

Stellar Nexus is a full-stack space exploration game built as a Discord bot with a web interface. Players command ships to explore sectors, engage in combat, trade resources, join guilds, and discover artifacts across a procedurally generated universe. The game features a tier-based ship progression system, multiple exploration types, and a dynamic market economy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and building
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom space-themed design system including CSS variables and custom fonts

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for scalable cloud hosting
- **API Design**: RESTful endpoints with centralized error handling and request logging
- **Game Logic**: Service-oriented architecture with separate systems for combat, exploration, economy, and guilds

### Data Storage Solutions
- **Primary Database**: PostgreSQL with comprehensive schema including users, ships, resources, guilds, alliances, explorations, combat logs, market transactions, and crafting recipes
- **ORM**: Drizzle with Zod integration for runtime validation and type safety
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Caching**: TanStack Query provides client-side caching with configurable stale times

### Game Systems
- **Ship Progression**: Six ship types (Scout, Fighter, Freighter, Explorer, Battlecruiser, Flagship) with four tiers each
- **Exploration Engine**: Multiple exploration types including sector scanning, hunting, artifact searching, and resource fishing
- **Combat System**: PvE combat with dynamic enemy generation based on user level and ship capabilities  
- **Economy**: Dynamic market with fluctuating prices, player-to-player trading, and crafting recipes
- **Guild System**: Four default factions (Stellar Dominion, Cosmic Traders, Void Explorers, Nexus Researchers) with contribution mechanics
- **Content Generation**: Procedural generation of sectors, planets, creatures, lore, and crafting recipes

### Authentication and Authorization
- **Discord Integration**: Uses Discord.js v14 for bot functionality and user authentication via Discord IDs
- **User Management**: Discord-based user identification with no separate authentication system required
- **Session Handling**: Express sessions stored in PostgreSQL for web interface access

## External Dependencies

### Core Technologies
- **Database**: Neon serverless PostgreSQL for primary data storage
- **Discord API**: Discord.js v14 for bot commands, interactions, and user authentication
- **Email/Notifications**: None currently implemented

### Development Tools
- **Build System**: Vite for frontend bundling and development server
- **TypeScript**: Full TypeScript support across frontend, backend, and shared types
- **Database Migrations**: Drizzle Kit for schema migrations and database management
- **Development**: tsx for TypeScript execution in development, esbuild for production builds

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS with PostCSS for processing
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (Inter, Orbitron, JetBrains Mono) for typography

### Third-Party Services
- **WebSocket Support**: ws library for Neon database connections
- **Date Handling**: date-fns for date manipulation and formatting
- **Utility Libraries**: clsx and class-variance-authority for dynamic styling, nanoid for unique ID generation

### Runtime Environment
- **Platform**: Designed for Replit deployment with specific development plugins
- **Environment Variables**: Requires DATABASE_URL and DISCORD_TOKEN for operation
- **Process Management**: Supports both development (tsx) and production (compiled) execution modes