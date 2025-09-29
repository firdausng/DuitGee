# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application deployed on Cloudflare Workers with Drizzle ORM and LibSQL database integration. The project follows a modern web stack optimized for edge deployment.

## Architecture

- **Framework**: SvelteKit 2.x with Svelte 5
- **Adapter**: `@sveltejs/adapter-cloudflare` for Cloudflare Workers deployment
- **Database**: LibSQL with Drizzle ORM for type-safe database operations
- **Styling**: TailwindCSS 4.x with forms and typography plugins
- **Package Manager**: pnpm (configured with esbuild-only built dependencies)

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Type checking
pnpm check
pnpm check:watch

# Database operations
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio

# Deployment
pnpm deploy       # Build and deploy to Cloudflare

# Generate Cloudflare Worker types
pnpm cf-typegen
```

## Key File Structure

- `src/lib/server/db/` - Database configuration and schema
  - `schema.ts` - Drizzle schema definitions
  - `index.ts` - Database client setup
- `drizzle.config.ts` - Drizzle kit configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
- `src/app.d.ts` - TypeScript global types for Cloudflare platform

## Database Setup

The project uses LibSQL with Drizzle ORM. Database URL must be set in `.env`:
```
DATABASE_URL=your_database_url
```

Schema changes should be made in `src/lib/server/db/schema.ts` followed by running `pnpm db:push` or generating migrations with `pnpm db:generate`.

## Cloudflare Integration

- Worker entry point: `.svelte-kit/cloudflare/_worker.js`
- Assets binding: `ASSETS` for static file serving
- Platform types available via `app.d.ts` interface
- Uses `nodejs_als` compatibility flag

## Development Notes

- Uses pnpm as package manager with specific esbuild build configuration
- TailwindCSS 4.x with Vite integration
- TypeScript configuration optimized for SvelteKit and Cloudflare Workers
- All database operations should use the Drizzle client from `src/lib/server/db/index.ts`