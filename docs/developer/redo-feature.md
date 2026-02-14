# Meditation Redo Feature

## Overview
This feature allows admins to regenerate completed meditations with a different mode (energizing vs calming) while preserving the previous version history. Users can redo meditations, and admins can restore any previous version.

## Features Implemented

### 1. Database Schema
**File:** `supabase/migrations/004_meditation_versions.sql`

- **meditation_versions table**: Stores historical versions when meditations are regenerated
  - Includes script text, audio URL, voice settings, metadata, and generation costs
  - Tracks which version is currently "live"
  - Supports version numbering (v1, v2, v3, etc.)

- **RPC Functions**:
  - `archive_meditation_version(p_meditation_id)`: Archives current meditation before redo
  - `set_meditation_version_live(p_version_id)`: Restores a historical version as live

### 2. Admin Pages

#### Completed Meditations Management
**Files:**
- `app/admin/meditations/page.tsx`
- `app/admin/meditations/MeditationList.tsx`

**Features:**
- Lists all completed meditations (with audio)
- Filters by mode (energizing/calming) and search by title/user
- Statistics dashboard (total completed, versions, users served)
- Redo button opens modal to regenerate with new mode
- View versions link to access version history

#### Version History
**Files:**
- `app/admin/meditations/[id]/versions/page.tsx`
- `app/admin/meditations/[id]/versions/VersionHistory.tsx`

**Features:**
- Displays current live version with audio player
- Shows all previous versions with metadata
- Each version shows:
  - Version number, mode badge (energizing/calming)
  - Script text (expandable)
  - Audio player (if available)
  - Generation cost and metadata
- Restore button to make any version live again

### 3. API Routes

#### Redo Meditation
**File:** `app/api/admin/redo-meditation/route.ts`

**POST /api/admin/redo-meditation**
- Archives current version
- Generates new script with specified mode (energizing/calming)
- Clears audio (requires regeneration)
- Tracks metadata (previous mode, version number)

**Request Body:**
```json
{
  "meditationId": "uuid",
  "mode": "energizing" | "calming",
  "feedback": "optional feedback"
}
```

#### Restore Version
**File:** `app/api/admin/restore-version/route.ts`

**POST /api/admin/restore-version**
- Archives current live version
- Restores selected version as live
- Updates all version flags

**Request Body:**
```json
{
  "versionId": "uuid"
}
```

### 4. Database Types
**File:** `types/database.ts`

Updated with:
- `meditation_versions` table types
- RPC function signatures

## Workflow

### Redo Workflow
1. Admin navigates to **Admin > Manage Meditations**
2. Clicks "Redo Meditation" on a completed meditation
3. Selects new mode (energizing or calming)
4. Optionally provides feedback/instructions
5. System:
   - Archives current version to `meditation_versions`
   - Generates new script with selected mode
   - Sets status to `pending_approval`
   - Clears audio (needs regeneration)
6. Admin reviews script at `/admin/script/[id]`
7. Admin approves script
8. Admin generates audio with voice selection
9. Meditation is complete with new mode

### Restore Workflow
1. Admin navigates to **View Versions** for a meditation
2. Views all previous versions
3. Clicks "Restore This Version" on desired version
4. System:
   - Archives current version
   - Restores selected version to meditations table
   - Marks version as live
5. Meditation now uses restored script and audio

## UI/UX

### Mode Badges
- **⚡ Energizing**: Orange badge with high-energy styling
- **🌊 Calming**: Blue badge with calm styling

### Status Indicators
- **LIVE** badge on current version
- Version numbers (v1, v2, v3, etc.)
- Generation timestamps
- Cost tracking

### Admin Dashboard
- Added "Manage Meditations" button to admin navbar
- Prominent placement for easy access

## Navigation Flow

```
/admin
  └─ Manage Meditations
      └─ /admin/meditations
          ├─ [List of completed meditations]
          │   ├─ View Script → /admin/script/[id]
          │   ├─ Redo Meditation (modal)
          │   └─ View Versions → /admin/meditations/[id]/versions
          │       ├─ Current Version (LIVE)
          │       └─ Previous Versions
          │           └─ Restore This Version
```

## Key Benefits

1. **Preserves History**: Never lose previous versions - all archived with audio
2. **Easy Mode Switching**: Toggle between energizing and calming modes
3. **Version Control**: Restore any previous version instantly
4. **Cost Tracking**: Each version tracks generation costs
5. **Admin Flexibility**: Full control over which version is live
6. **User Transparency**: Users always see the currently active version

## Database Impact

- New table: `meditation_versions` (minimal storage impact - only stores when redone)
- Two new RPC functions for atomic version operations
- No changes to existing tables (backwards compatible)

## Build Status
✅ **Build Passes**: 34 routes compiled successfully
