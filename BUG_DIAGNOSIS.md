# Bug Diagnosis: Missing Images and Creator Data

## Root Cause

The issue was **data structure mismatch** between SSR data and the expected ContentItem format.

### The Problem

1. **SSR Loader** returns raw database records with `author` field:
   ```typescript
   {
     id: "123",
     title: "Book Title",
     cover_url: "https://...",
     author: { id, name, avatar_url, username }  // ← Raw DB structure
   }
   ```

2. **ContentItem type** expects transformed data with `creator` field:
   ```typescript
   {
     id: "123",
     title: "Book Title",
     thumbnail: "https://...",  // ← Renamed from cover_url
     creator: { id, name, avatar, username, followers }  // ← Transformed structure
   }
   ```

3. **Initial state** was directly using SSR data WITHOUT transformation:
   ```typescript
   useState(() => {
     if (initialData) {
       return {
         audiobooks: initialData.audiobooks,  // ← Raw DB records!
         // ...
       };
     }
   });
   ```

### Why Some Sections Worked

- **"Popular Collections"** - Fetches and transforms its own data ✅
- **"Recommended for You"** - Fetches and transforms its own data ✅
- **All other carousels** - Used the broken `allContent` state ❌

### The Symptoms

1. **Missing images** - `cover_url` field not mapped to `thumbnail`
2. **Missing creator names** - `author` object not transformed to `creator`
3. **Playback not working** - Navigation URLs built from wrong data structure
4. **Missing avatars** - `avatar_url` not mapped to `avatar`

## The Fix

Changed the initialization to:
1. **Always start with empty state**
2. **Always run transformation in useEffect** (even for SSR data)
3. **Transform SSR data through the same pipeline** as client-fetched data

This ensures:
- SSR data gets properly transformed with `creator` field
- `cover_url` → `thumbnail` mapping happens
- Fallback images are applied
- View counts and likes are looked up
- All data matches the ContentItem interface

## Result

✅ All content now displays correctly  
✅ Creator names and avatars show up  
✅ Images load (with fallbacks)  
✅ Playback works  
✅ Still benefits from SSR (data pre-fetched on server)
