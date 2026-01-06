# Euphoria Paintings - Backend Setup Guide

## 🔧 Quick Setup

### Step 1: Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase/schema.sql` and run it
5. This creates:
   - `artworks` table - Store your art pieces
   - `commissions` table - Commission requests
   - `contacts` table - Contact form submissions
   - `site_settings` table - Configurable settings

### Step 2: Set Up Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Name it `artworks`
4. Enable **Public bucket**
5. Add a policy to allow authenticated uploads

### Step 3: Configure Environment Variables

Edit the `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key_here

# Cloudflare R2 (Optional - for R2 storage instead of Supabase)
VITE_R2_ACCOUNT_ID=your_r2_account_id
VITE_R2_BUCKET_NAME=your_bucket_name
VITE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**Where to find your keys:**
- **SUPABASE_URL**: Project Settings > API > Project URL
- **SUPABASE_ANON_KEY**: Project Settings > API > anon/public key

### Step 4: Run the Project

```bash
npm install
npm run dev
```

---

## 📁 Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client
├── services/
│   ├── artworkService.js    # Artwork CRUD operations
│   ├── commissionService.js # Commission requests
│   ├── contactService.js    # Contact form handling
│   └── storageService.js    # Image uploads
├── hooks/
│   ├── useArtworks.js       # Artwork data hook
│   ├── useContactForm.js    # Contact form hook
│   └── useCommission.js     # Commission hook
└── pages/
    ├── Gallery/             # Uses useArtworks hook
    └── Contact/             # Uses contactService
```

---

## 🎨 Managing Artworks

### Adding Artworks via Supabase Dashboard

1. Go to **Table Editor** > **artworks**
2. Click **Insert Row**
3. Fill in:
   - `title` - Artwork name
   - `description` - Details about the piece
   - `category` - abstract, landscapes, portraits, etc.
   - `year` - Year created
   - `price` - Price in dollars
   - `is_featured` - Show on homepage
   - `image_url` - Public URL of the image

### Uploading Images

1. Go to **Storage** > **artworks**
2. Upload your image
3. Click on the image > Copy URL
4. Paste the URL in the artwork's `image_url` field

---

## 📧 Contact Form Submissions

All contact form submissions are stored in the `contacts` table. 

To view submissions:
1. Go to **Table Editor** > **contacts**
2. View all messages with email, project type, budget, etc.

---

## 🎯 Commission Requests

Commission requests from the modal are stored in `commissions` table.

Status values:
- `pending` - New request
- `in_progress` - Currently working on it
- `completed` - Finished
- `cancelled` - Cancelled

---

## 🔒 Security Notes

- **Never commit `.env` file** - It's in .gitignore
- Use **Row Level Security (RLS)** - Already configured in schema
- **anon key is safe** for client-side use (limited permissions)
- **service_role key** should only be used server-side

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
