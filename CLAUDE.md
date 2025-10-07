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

- The project uses cloudflare D1 with Drizzle ORM.
- Migration done by wrangler.

### Migration
```
pnpm drizzle-kit generate
wrangler d1 migrations apply "duitgee"
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

### Vault Access Control and Permissions

**CRITICAL**: All operations under a `vaultId` MUST verify user permissions before execution.

#### Permission Check Pattern

For any handler that operates on vault resources (expenses, templates, categories, etc.), you MUST verify that the user has access to the vault:

```typescript
// Example: Verify vault access before showing vault expenses
const vaultAccess = await client
    .select({ id: vaults.id })
    .from(vaults)
    .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
    .where(
        and(
            eq(vaults.id, vaultId),
            or(
                eq(vaults.ownerId, userId),      // User is vault owner
                and(
                    eq(vaultMembers.userId, userId),
                    eq(vaultMembers.status, 'active')  // User is active member
                )
            )
        )
    )
    .limit(1);

if (vaultAccess.length === 0) {
    throw new Error('Access denied to this vault');
}

// Now safe to perform vault operations
whereClause = eq(expenses.vaultId, vaultId);
```

#### Permission Levels

1. **Vault Owner** (`vaults.ownerId = userId`)
   - Full access to all vault operations
   - Can delete vault
   - Can manage members
   - Can edit vault settings

2. **Active Member** (`vaultMembers.status = 'active'`)
   - Can view vault expenses
   - Can create expenses
   - Can edit/delete own expenses (depending on vault settings)
   - Cannot delete vault
   - Cannot remove other members (unless admin)

3. **Admin Member** (`vaultMembers.permissions = 'admin'`)
   - Same as active member plus:
   - Can edit vault settings
   - Can manage members

#### Key Files with Permission Checks

- `src/lib/server/api/expenses/handlers.ts:304-325` - Vault expense access validation
- `src/lib/server/api/vaults/handlers.ts:210-229` - Vault access check in `getVault()`
- `src/lib/server/api/vaults/handlers.ts:493-505` - Owner-only vault deletion check
- `src/lib/server/api/vaults/handlers.ts:446-460` - Admin-only vault update check

#### Adding New Vault Resources

When adding a new resource type under `vaultId` (e.g., categories, tags, templates):

1. **Create handler function** with vault access check FIRST
2. **Verify user permission** before any database operations
3. **Throw descriptive error** if access denied
4. **Document permission level** required for the operation

Example for new resource:
```typescript
export const getVaultCategories = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // FIRST: Check vault access
    const hasAccess = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, userId),
                    and(eq(vaultMembers.userId, userId), eq(vaultMembers.status, 'active'))
                )
            )
        )
        .limit(1);

    if (hasAccess.length === 0) {
        throw new Error('Access denied to vault categories');
    }

    // THEN: Perform operation
    return client.select().from(categories).where(eq(categories.vaultId, vaultId));
};
```

**Remember**: Security is not optional. Every vault operation MUST validate permissions.

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

### SvelteKit Navigation Functions
**pushState Usage** (`$app/navigation`):
- Correct syntax: `pushState(url, state)` where url is a string
- Always convert URL objects to strings: `pushState(newUrl.toString(), '')`
- To preserve current pathname with updated query params:
  ```typescript
  const params = new URLSearchParams(page.url.searchParams);
  params.set('period', period);
  const newUrl = `${page.url.pathname}?${params.toString()}`;
  pushState(newUrl, '');
  ```
- **Common mistake**: Passing URL object directly causes `[object Object]` in URL
- **Common mistake**: Wrong parameter order - url comes first, then state

### Loading States
- Use SvelteKit's `$navigating` store for page navigation loading states
- Display loading indicators during data fetching
- Example: `let isLoading = $derived(!!$navigating);`

## Dashboard and Expense Pages

### Time Period Filtering
- Supports: daily, weekly, monthly, yearly, all
- Period state managed via URL query parameter `?period=xxx`
- **Client calculates date ranges, server filters by date range**
- Date range calculations done in user's timezone on client
- Server receives ISO date strings and filters expenses

**Vault Dashboard Implementation** (`src/routes/(auth)/vaults/[vaultId]/+page.svelte`):
- Initial page load from `+page.server.ts` with default period (monthly)
- Changing filters triggers API call to `/api/vaults/:id/stats`
- Client calculates `startDate` and `endDate` in user's timezone based on selected period
- Sends ISO date strings to server: `?startDate=2025-10-01T00:00:00.000Z&endDate=2025-10-31T23:59:59.999Z`
- Uses `pushState` to update URL query params without full page reload
- Shows loading state while fetching filtered data

**API Endpoint** (`src/lib/server/api/vaults/vaults.ts`):
- `GET /api/vaults/:id/stats?startDate=xxx&endDate=xxx&memberIds=xxx&limit=xxx`
- Accepts ISO date strings from client (no period calculation)
- Calls `getExpenses`, `getExpensesSummary`, `getMemberSpending` handlers with date filters
- Returns filtered stats: `{ success: true, data: { totalExpenses, totalAmount, recentExpenses, memberSpending } }`

**Implementation Pattern**:
```typescript
// Client calculates date range in user's timezone
function calculateDateRange(period: Period): { startDate?: string, endDate?: string } {
  const now = new Date();
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  switch (period) {
    case 'daily':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    // ... other cases
  }

  return {
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString()
  };
}

// Fetch with calculated date range
async function fetchStats() {
  const { startDate, endDate } = calculateDateRange(currentPeriod);
  const params = new URLSearchParams({ limit: expenseLimit.toString() });

  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (selectedMemberIds.length > 0) {
    params.set('memberIds', selectedMemberIds.join(','));
  }

  const response = await fetch(`/api/vaults/${vaultId}/stats?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const result = await response.json();
  statsData = result.data;
}
```

**Benefits**:
- Timezone-aware filtering (date ranges calculated in user's local timezone)
- Server doesn't need to know about timezones
- Client controls the exact date range being filtered
- API accepts any arbitrary date range

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

## Seed
- some data need to be seeded
- store all seed sql in `seed` folder
- sql file will be run manually, so do try to run it

## Template System (Expense Templates)

### Database Schema
**Template Table** (`expenseTemplates` in `src/lib/server/db/schema.ts`):
- `userId` (NOT NULL) - Template creator/owner, always set to creator's ID
- `defaultUserId` (optional) - Who the expense should be assigned to when using template:
  - `"__creator__"` - Dynamic, assigns to whoever uses the template (default)
  - `null` or empty - Creates vault-level expense
  - Specific user ID - Always assigns to that user
- `vaultId` - Template belongs to a vault
- Other fields: `name`, `description`, `categoryId`, `defaultAmount`, `paymentTypeId`, `paymentProviderId`, `note`, `icon`, `iconType`
- Usage tracking: `usageCount`, `lastUsedAt`
- Tags: Junction table `expenseTemplateTags` links to `tags` table

### Migration 0010
**File**: `migrations/0010_sad_katie_power.sql`
- Makes `userId` NOT NULL (template creator)
- Adds `defaultUserId` field for default expense assignment
- Migrates data:
  - Old `userId` (was optional, meant default expense user) → new `defaultUserId`
  - New `userId` (template creator) ← `COALESCE(old_userId, created_by)`

### API Handlers Architecture
**All Drizzle queries MUST be in handlers** (`src/lib/server/api/*/handlers.ts`), NOT in page.server.ts files.

**Template Handlers** (`src/lib/server/api/templates/handlers.ts`):
- `getTemplates(userId, vaultId, db)` - Returns ALL templates in vault (not filtered by userId)
  - Ordered by `usageCount DESC, lastUsedAt DESC` (most used first)
  - Includes category and tags relations
- `getTemplate(userId, templateId, db)` - Get single template (no userId filter, vault-wide access)
- `createTemplate(creatorUserId, data, db)` - Create new template
  - Always sets `userId = creatorUserId` (template owner)
  - Sets `defaultUserId` from form data
- `updateTemplate(updaterUserId, templateId, data, db)` - Update template
  - Only creator can edit (filters by userId in WHERE clause)
- `deleteTemplate(userId, templateId, db)` - Soft delete template
  - Only creator can delete (filters by userId in WHERE clause)
- `incrementTemplateUsage(templateId, db)` - Increment usage counter when template is used

**Vault Members Handler** (`src/lib/server/api/vaults/handlers.ts`):
- `getVaultMembers(vaultId, db)` - Get vault owner + active members
  - Returns unified list with owner first
  - Used by templates and expenses pages

### UI Components

**Template Selector** (REPLACED):
- Old: Horizontal scrollable component `TemplateSelector.svelte`
- New: Template grid on expenses/new page (before showing expense form)

**Expense Forms**:
- **CreateExpenseForm** (`src/lib/components/CreateExpenseForm.svelte`):
  - For creating new expenses
  - All fields start empty/with defaults
  - Uses bits-ui components (Combobox, Select) with icons
  - No template functionality (templates handled at page level)

- **EditExpenseForm** (if exists):
  - For editing existing expenses
  - Pre-filled with expense data

**Template Forms**:
- **CreateExpenseTemplateForm** (`src/lib/components/CreateExpenseTemplateForm.svelte`):
  - For creating new templates
  - All fields start empty/with defaults
  - Uses bits-ui Select components with IconDisplay
  - Category: Select with category icons
  - Payment Type: Select with payment type icons
  - Payment Provider: Select with dynamic filtering (e_wallet vs bank) and provider icons
  - Default User: Select with predefined options

- **EditExpenseTemplateForm** (`src/lib/components/EditExpenseTemplateForm.svelte`):
  - For editing existing templates
  - Pre-filled with template data
  - Same components as CreateExpenseTemplateForm but with initial values
  - Uses bits-ui Select components with IconDisplay throughout

**Component Patterns**:
- Separate create/edit forms (don't reuse same component for both)
- bits-ui components: Combobox for searchable fields, Select for fixed options
- IconDisplay component used to show icons in dropdowns
- Payment provider filtering based on payment type:
  ```typescript
  let paymentProviderForPaymentType = $derived.by(()=>{
      if(!selectedPaymentType) return [];
      if(selectedPaymentType?.code === 'cash') return [];
      if(selectedPaymentType?.code === 'e_wallet') {
          return paymentProviders.filter(p => p.type === 'e_wallet').map(p => ({
              ...p, value: p.id, label: p.name,
          }));
      }
      return paymentProviders.filter(p => p.type === 'bank').map(p => ({
          ...p, value: p.id, label: p.name,
      }));
  })
  ```
- When payment type changes, clear payment provider selection

**Default User Options** (for templates):
- "User who creates the expense (Default)" → `__creator__`
- "Vault Expense" → empty string
- "Myself" → template creator's ID
- Other members → specific member IDs
- Field name: `defaultUserId` (not `userId`)

### Page Server Files

**Templates Page** (`src/routes/(auth)/vaults/[vaultId]/templates/+page.server.ts`):
- Load function:
  - Uses handlers: `getVault`, `getTemplates`, `getTags`, `getCategories`, `getPaymentTypes`, `getPaymentProviders`, `getVaultMembers`
  - NO direct Drizzle queries
- Actions:
  - `create`: Extracts `defaultUserId` from form, passes to `createTemplate`
  - `update`: Extracts `defaultUserId` from form, passes to `updateTemplate`
  - `delete`: Calls `deleteTemplate`

**Expense New Page** (`src/routes/(auth)/vaults/[vaultId]/expenses/new/+page.server.ts`):
- Load function:
  - Uses handlers: `getCategories`, `getTags`, `getTemplates`, `getVaultMembers`
  - NO direct Drizzle queries
  - Sets default `userId` to current user in form

**Templates Page Component** (`src/routes/(auth)/vaults/[vaultId]/templates/+page.svelte`):
- Submit function:
  - Special handling for `defaultUserId` - allows empty string (vault expense option)
  - Uses FormData to submit to server actions
- Edit function:
  - Maps `template.tags` to `tagNames` array
  - Includes `defaultUserId` in form data

### Key Concepts

**Template Ownership vs Expense Assignment**:
1. **Template Creator** (`userId`): Who created the template - never null
2. **Default Expense User** (`defaultUserId`): Who expense should be assigned to when using template
   - Can be `"__creator__"`, empty, or specific user ID
   - This is what gets applied to the expense when template is used

**Vault-Wide Templates**:
- All vault members can see and use all templates in the vault
- Templates are ordered by usage count (most used first)
- Only template creator can edit/delete their own templates
- Permissions handled in handlers (WHERE clauses filter by userId for updates/deletes)

**Searchable Interface**:
- Templates use same SearchableSelect component as categories
- Client-side filtering by name and note
- Relevance sorting: exact match → starts with → usage count

### Running Seeds

**Malaysian Banks Seed** (`seed/0004_seed_malaysian_banks.sql`):
```bash
npx wrangler d1 execute duitgee --local --file=./seed/0004_seed_malaysian_banks.sql
```

Includes:
- 20 Malaysian banks (Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank, UOB, OCBC, HSBC, Standard Chartered, Islamic banks, etc.)
- 5 Malaysian e-wallets (Touch 'n Go eWallet, Boost, GrabPay, MAE by Maybank, BigPay)

### Common Patterns

**Handler Function Pattern**:
```typescript
export const getSomething = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });
    // Query logic here
    return results;
};
```

**Page Server Load Pattern**:
```typescript
export const load: PageServerLoad = async ({ locals, platform, params }) => {
    const [data1, data2, data3] = await Promise.all([
        getHandler1(...),
        getHandler2(...),
        getHandler3(...)
    ]);
    return { data1, data2, data3 };
};
```

**Svelte 5 Runes Pattern**:
```typescript
let state = $state(initialValue);
let derived = $derived(computation);
$effect(() => {
    // Side effect when dependencies change
});
```