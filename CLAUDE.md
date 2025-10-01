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

## Common Issues and Fixes

### User Authentication (OAuth Callback)
**Issue**: Last name field was being populated with first name value
**Locations**:
- `src/routes/(anonymous)/callback/+server.ts:33` - Initial user creation
**Fix**: Changed `lastName: authResponse.user.firstName` to `lastName: authResponse.user.lastName`
**Impact**: New users created after this fix will have correct last names

### User Profile Management
**Profile Page** (`src/routes/(auth)/profile/+page.svelte`):
- Users can edit their firstName and lastName
- Email is read-only (managed by WorkOS)
- Form uses sveltekit-superforms with valibot validation
- Updates persist to database via `updateUser()` handler

**Implementation** (`src/routes/(auth)/profile/+page.server.ts`):
- Server action calls `updateUser(userId, data, db)` from `src/lib/server/api/users/handlers.ts`
- Updates session with new user data after successful save
- Proper error handling with user-friendly messages

### Invitation Acceptance Errors
**Issue**: "Invitation not found or already processed" error when accepting invitations
**Root Causes**:
1. Timezone issues with `invitedAt` dates (using `formatISO()` instead of `.toISOString()`)
2. Need better error handling to identify specific failure reasons

**Enhanced Error Handling** (`src/lib/server/api/vault-members/handlers.ts:100-153`):
- "Invitation not found" - invitation ID doesn't exist
- "This invitation is not for you" - invitation belongs to different user
- "Invitation already {status}" - invitation already accepted/declined
- Includes logging to help debug issues

### Mobile Navigation
**Mobile Menu**: Edit Vault option added to mobile dropdown menu (`src/routes/(auth)/+layout.svelte:296-304`)
- Available when inside a vault
- Uses Gear icon matching desktop "Manage" dropdown

### WorkOS Rate Limiting
**Issue**: Rate limit errors when making multiple API calls (dashboard loads 3 endpoints in parallel)
**Root Cause**: Hono API middleware was calling WorkOS `verifiedSession()` and `getUser()` on every API request
**Fix** (`src/lib/server/api/index.ts:20-88`):
- Uses Cloudflare KV to cache token verification results
- Token is hashed with SHA256 before storing (KV key: `token:{hash}`)
- First request verifies token with WorkOS and caches result for 5 minutes (TTL: 300s)
- Subsequent requests with same token use cached email (no WorkOS API call)
- Automatic expiration handled by KV TTL
- Graceful fallback if KV is unavailable (warns but continues)
- Reduces WorkOS API calls from N per page load to 1 per 5 minutes per token
- Prevents rate limit errors during normal browsing
- KV cache works across multiple Cloudflare Workers instances

## API Architecture

- **API Routes**: Handled by Hono framework through catch-all route at `src/routes/[...path]/+server.ts`
- **API Implementation**: Located in `src/lib/server/api/`
  - Main API entry: `src/lib/server/api/index.ts`
  - Domain-specific APIs: `expenses`, `categories`, `vaults`, etc.
- **Middleware**: Authentication and session handling in `src/lib/server/middleware.ts`
- **API Base Path**: `/api/*` routes are proxied to Hono handlers

## Date and Timestamp Handling

**CRITICAL**: All dates and timestamps MUST be stored in UTC format using `.toISOString()`

### Important Rules:
1. **Never use `formatISO()` from date-fns** - It includes timezone offsets (e.g., `+08:00`)
2. **Always use `.toISOString()`** - Returns UTC format with `Z` suffix (e.g., `2025-10-01T08:00:00.000Z`)
3. **Audit Fields**: All `createdAt`, `updatedAt`, `deletedAt` timestamps use UTC
4. **Expense Dates**: All expense `date` fields use UTC
5. **Invitation Dates**: All `invitedAt`, `joinedAt` timestamps use UTC

### Files That Handle Dates:
- `src/lib/server/utils/audit.ts` - Audit timestamp generation (uses `.toISOString()`)
- `src/lib/server/api/expenses/handlers.ts` - Expense date handling (uses `.toISOString()`)
- `src/lib/server/api/vault-members/handlers.ts` - Invitation date handling (uses `.toISOString()`)
- `src/lib/server/api/users/handlers.ts` - User update timestamp (uses `.toISOString()`)

### Migration:
- Run `seed/fix_expense_dates_timezone.sql` to convert existing timezone-offset dates to UTC
- This fixes dates in: expenses, categories, category_groups, vaults, vault_members

## UI/UX Patterns

### Mobile Dropdown Selects
When using `<select>` with period/filter changes that trigger navigation:
- Use `value={state}` (one-way binding), NOT `bind:value={state}`
- Handle changes with `onchange={(e) => handler(e.target.value)}`
- **Why**: Using `bind:value` with `onchange` creates a race condition where the value updates before navigation, causing the navigation check to fail

### Loading States
- Use SvelteKit's `$navigating` store for page navigation loading states
- Display loading indicators during data fetching
- Example: `let isLoading = $derived(!!$navigating);`

## Dashboard and Expense Pages

### Time Period Filtering
- Supports: daily, weekly, monthly, yearly, all
- Period state managed via URL query parameter `?period=xxx`
- Date ranges calculated in `calculateDateRange()` function
- All date comparisons done in UTC timezone

### Recent Expenses Display
- Dashboard: Shows 5 most recent expenses via API call
- Compact layout with creator information
- Mobile version includes creator details below category/date
- Creator display format: "FirstName LastName (email)" if name exists, otherwise just email

### Vault Member Expenses
- When viewing a vault, ALL expenses from vault members are shown (not just current user's expenses)
- Access control: Users must be vault owner or active member to view vault expenses
- Creator information is always displayed to identify who created each expense

### Period Summary Header
- Shows total expenses count and amount for selected period
- Includes spending breakdown by member (for shared vaults)
- Member stats show: name/email, expense count, and total amount spent

### Member Filtering
**Backend Support** (`src/lib/server/api/expenses/handlers.ts`):
- `getExpenses` and `getExpensesSummary` accept `memberIds` array parameter
- Filters expenses by specific member user IDs (OR condition - any match included)
- API endpoints accept comma-separated `memberIds` query parameter

**Frontend Integration**:
- Filter by one or multiple vault members
- URL parameter: `?memberIds=userId1,userId2`
- Combined with time period and category filters
- Available on both dashboard and expense list pages

**Example API Call**:
```
/api/expenses/vaults/{vaultId}/expenses?memberIds=user123,user456&startDate=...&endDate=...
```

### Delete Functionality
- Uses `AlertDialog` component from bits-ui for confirmation
- Available on both dashboard and expense list pages
- Mobile and desktop layouts both include delete buttons
- Delete button styled with destructive variant (red color)