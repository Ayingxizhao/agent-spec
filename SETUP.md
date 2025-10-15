# PostgreSQL Migration Setup Guide

## What Changed

The pattern storage system has been migrated from JSON-only to **PostgreSQL with JSON fallback**.

### Architecture

```
API Routes (learn-correction, generate-code, etc.)
    ↓
lib/learning-store.ts (backward compatible interface)
    ↓
lib/storage-adapter.ts (fallback logic)
    ↓
    ├─→ lib/db-store.ts (PostgreSQL) ← PRIMARY
    └─→ data/learned-preferences.json (JSON) ← FALLBACK
```

### Files Created

- **`lib/db.ts`** - PostgreSQL client and schema initialization
- **`lib/db-store.ts`** - Database operations (CRUD for patterns & history)
- **`lib/storage-adapter.ts`** - Smart fallback logic (DB → JSON)
- **`lib/migrations/run.js`** - Migration runner script
- **`lib/migrations/README.md`** - Database documentation
- **`app/api/db-status/route.ts`** - Health check endpoint

### Files Modified

- **`lib/learning-store.ts`** - Now delegates to storage-adapter
- **`package.json`** - Added `@vercel/postgres` dependency and `db:migrate` script
- **`.env.local`** - Added DATABASE_URL placeholder

## Setup Instructions

### 1. Add Your Database URL

Edit `.env.local` and uncomment/add your PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### 2. Install Dependencies (Already Done)

```bash
npm install
```

### 3. Initialize Database Schema

**Option A: Using npm script**
```bash
npm run db:migrate
```

**Option B: Using API endpoint**
```bash
# Start dev server
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/db-status
```

### 4. Verify Setup

Check database status:
```bash
curl http://localhost:3000/api/db-status
```

Expected response:
```json
{
  "configured": true,
  "connected": true,
  "message": "Database connected"
}
```

## Database Schema

### `patterns` Table
Stores extracted patterns from code corrections.

```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  example TEXT,
  task_context TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `task_history` Table
Stores task history with suggestions and corrections.

```sql
CREATE TABLE task_history (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  task_timestamp BIGINT NOT NULL,
  suggestion_code TEXT NOT NULL,
  suggestion_language TEXT NOT NULL,
  suggestion_explanation TEXT,
  suggestion_applied_preferences TEXT,
  correction_feedback TEXT,
  correction_code TEXT,
  correction_type TEXT,
  accepted BOOLEAN NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Fallback Behavior

The system automatically handles database failures:

1. **No DATABASE_URL** → Uses JSON immediately
2. **Connection fails** → Logs warning, uses JSON
3. **Query fails** → Falls back to JSON for that request
4. **Connection check** → Cached for 1 minute to avoid overhead

**No errors thrown** - the app continues working seamlessly.

## Testing the System

### Test Pattern Extraction
```bash
curl http://localhost:3000/api/test-pattern
```

This endpoint:
1. Compares basic vs secure login code
2. Extracts security patterns using GPT-4o-mini
3. Returns diff analysis and extracted patterns

### Test Pattern Storage

**Generate code with correction:**
1. Visit `http://localhost:3000`
2. Enter task: "Create login endpoint"
3. Review generated code
4. Provide correction/feedback
5. Check database or JSON file for stored pattern

**Verify storage:**
```bash
# Check database (if connected)
psql $DATABASE_URL -c "SELECT * FROM patterns;"

# Or check JSON fallback
cat data/learned-preferences.json
```

## Troubleshooting

### Database not connecting?
- Verify DATABASE_URL format
- Check firewall/network access
- Ensure SSL mode matches your provider
- System will use JSON fallback automatically

### Migration fails?
- Check database permissions
- Ensure database exists
- Try manual schema creation using SQL from `lib/db.ts`

### Want to force JSON mode?
- Comment out DATABASE_URL in `.env.local`
- System will skip connection attempts

## Next Steps

1. **Add DATABASE_URL** to your `.env.local`
2. **Run migration**: `npm run db:migrate`
3. **Start dev server**: `npm run dev`
4. **Test the system** using the UI or API endpoints

The system is now ready to store patterns in PostgreSQL with automatic JSON fallback!
