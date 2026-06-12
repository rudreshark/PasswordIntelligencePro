# PassIntell Pro - Updated!

## What's New?

1. **New Branding**: Changed from "PassCheck Matrix" to "PassIntell Pro" with a cyber-themed quote!
2. **Advanced UI/UX**: Added cool animations, hover effects, glowing cards, and smooth transitions!
3. **Vault Login**: Users must now set and enter a master password to access their vault!
4. **Cloud Storage**: Added Supabase support for cloud-based vault storage (with local storage fallback)!
5. **OWASP Top 10 Security**: Implemented security headers, input sanitization, and secure practices!
6. **Cloudflare Hosting Ready**: Configuration files for Cloudflare Pages included!

## How to Host on Cloudflare Pages

1. Create a Cloudflare account at https://pages.cloudflare.com/
2. Connect your Git repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add your environment variables in the Cloudflare dashboard (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY if using Supabase)
6. Deploy!

## How to Set Up Supabase (Optional)

1. Create a project at https://supabase.com/
2. Go to Settings → API and copy your URL and anon public key
3. Create a `.env` file in your project root with these values (use `.env.example` as a template)
4. In the Supabase SQL Editor, create a `vault_entries` table:

```sql
create table vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target text not null,
  identity text not null,
  secret text not null,
  score integer not null,
  breach text not null,
  created_at bigint not null
);

alter table vault_entries enable row level security;

create policy "Users can manage their own entries"
on vault_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Security Features

- **X-Frame-Options: DENY** - Prevents clickjacking
- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- **X-XSS-Protection: 1; mode=block** - Enables XSS protection
- **CSP Policy** - Restricts resource loading
- **Permissions Policy** - Disables unnecessary permissions
