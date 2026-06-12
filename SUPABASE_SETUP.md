# Supabase Setup Guide for PassIntell Pro

Follow these steps to set up Supabase for your PassIntell Pro application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/sign up
2. Click "New Project"
3. Fill in the details:
   - Name your project (e.g., "PassIntell Pro")
   - Set a strong database password (save this!)
   - Choose a region close to you
4. Click "Create new project" and wait for it to initialize (takes a few minutes)

## 2. Set Up Database Tables

Once your project is ready:

1. Go to your project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `supabase-setup.sql`
5. Click "Run" to execute the SQL

This will create two tables:
- `request_logs`: Stores all your WAF monitoring logs (IP addresses, requests, etc.)
- `vault_entries`: Stores password vault entries

## 3. Get Your API Credentials

1. In your Supabase project dashboard, click "Settings" (gear icon) in the left sidebar
2. Click "API"
3. Copy the following values:
   - **Project URL**: Looks like `https://xxxxxx.supabase.co`
   - **anon public**: The long API key

## 4. Configure Your Project

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 5. Deploy to Netlify (or any platform)

### Option A: Netlify Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select your repository
5. In the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your values
7. Click "Deploy site"

### Option B: Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. In the configuration:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add environment variables:
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

## 6. View Your Logs

To view all your stored logs:

1. Go to your Supabase project dashboard
2. Click "Table Editor" in the left sidebar
3. Select the `request_logs` table
4. You'll see all your logs with timestamps, IP addresses, and more!

## Security Notes

The current setup allows public access for demonstration purposes. For production:

1. Consider adding authentication
2. Restrict RLS policies to authenticated users only
3. Add IP rate limiting
4. Enable Supabase Auth for user management

## Local Development

Run your app locally with:
```bash
npm run dev
```

Your app will automatically use Supabase for logs and vault storage when the environment variables are set. If not, it will fall back to localStorage.
