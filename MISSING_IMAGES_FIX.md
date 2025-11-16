# Missing Images Issue - Solution Guide

## Problem
Images are not showing in "Trending Now", "New Releases", and Hero Banner sections. Only "Popular Collections" and "Recommended for You" show images.

## Root Cause
The database records are missing `cover_url` values for most audiobooks, books, and podcasts.

## Temporary Fix Applied
I've updated the UI to show better placeholders when images are missing:

### Content Cards (Trending Now, New Releases)
- Shows a gradient background with the content type icon
- Displays the title and author name
- Uses theme colors (primary color gradient)
- Professional appearance instead of generic "No Cover" text

### Hero Banner
- Shows a gradient background when no image is available
- Maintains the overlay effects for text readability
- Gracefully handles missing images

## Permanent Solution Needed

### Option 1: Upload Cover Images to Supabase Storage

1. **Create a storage bucket** in Supabase:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('covers', 'covers', true);
   ```

2. **Upload images** via Supabase Dashboard or API

3. **Update records** with storage URLs:
   ```sql
   -- Example update
   UPDATE audiobooks 
   SET cover_url = 'https://your-project.supabase.co/storage/v1/object/public/covers/audiobook-1.jpg'
   WHERE id = 'your-audiobook-id';
   ```

### Option 2: Use External Image URLs

If you have images hosted elsewhere (like AWS S3, Cloudinary, etc.):

```sql
-- Update with external URLs
UPDATE audiobooks 
SET cover_url = 'https://your-cdn.com/covers/audiobook-1.jpg'
WHERE id = 'your-audiobook-id';
```

### Option 3: Generate Placeholder Images

Use a service like:
- **Unsplash API** - Free high-quality images
- **Pexels API** - Free stock photos
- **Generated covers** - Use a service to generate book covers

## Check Your Database

Run the SQL script in `scripts/check-missing-covers.sql` to see:
- How many records are missing cover URLs
- Which specific records need images
- Summary statistics

## Testing

After adding cover URLs to your database:
1. Clear browser cache
2. Refresh the application
3. Images should load automatically

## Current Placeholder Behavior

Until you add real images, the app will show:
- **Content cards**: Gradient background with icon, title, and author
- **Hero banner**: Gradient background with text overlay
- **Collections**: These already work (they have images)

## Next Steps

1. Run `scripts/check-missing-covers.sql` in Supabase SQL Editor
2. Identify which records need images
3. Choose one of the solutions above
4. Upload/add cover URLs to your database
5. Test the application

## Questions?

If you need help with:
- Setting up Supabase Storage
- Bulk uploading images
- Generating placeholder images
- Writing update scripts

Let me know and I can provide more specific guidance!
