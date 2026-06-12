# PassIntell Pro 🛡️

**Professional Password Intelligence & Analysis Platform** — Client-side password analysis, generation, breach checking, secure vault, and compliance audit.

## 🌟 Features

- ✅ **Dual Telemetry Analysis**: Compare 2 passwords side-by-side with radar charts
- ✅ **Advanced Generator**: Passwords & passphrases using Web Crypto
- ✅ **Breach Intelligence**: HIBP k-anonymity API checks
- ✅ **Secure Vault**: Local storage-based encrypted vault
- ✅ **Compliance Audit**: Policy-based password health checking
- ✅ **WAF/IP Monitoring**: IP detection + Supabase logging
- ✅ **Full Responsive UI**: Mobile, tablet, desktop perfect
- ✅ **Beautiful User-Friendly Design**: Clean, professional look

## 🚀 Quick Start

### 1. Running Locally

```bash
# Install dependencies and start both client & server
cd client && npm install
cd ../server && npm install
# Then open two terminals:
npm start  # in server/
npm run dev  # in client/
# App available at http://localhost:8080
```

## 🌐 Deploying to Production

### Option 1: Netlify (Easiest for Frontend Only)
1. Go to https://app.netlify.com
2. Connect your GitHub repo `https://github.com/rudreshark/PasswordIntelligencePro`
3. Set **Base directory**: `client/`
4. **Build command**: `npm run build`
5. **Publish directory**: `dist`
6. **Environment Variables** (optional, for Supabase):
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Deploy! 🚀

### Option 2: Vercel
1. Go to https://vercel.com
2. Import your GitHub repo
3. Override **Root Directory** to `client/`
4. Add the same environment variables as above
5. Deploy! 🚀

### Option 3: Full-Stack (Client + Express Server)
For full server hosting (e.g., on Render, Railway, or AWS):
- Deploy `server/` as a Node.js app on your favorite platform
- Deploy `client/` as static assets (using Vercel/Netlify, or serve via Express)

## 🔧 Supabase Setup (Optional)
For storing request logs and vault data:
1. Go to https://supabase.com and make a project
2. Run the `supabase-setup.sql` file in your project's SQL Editor
3. Set your Supabase environment variables (see above)

## 📝 License
MIT
