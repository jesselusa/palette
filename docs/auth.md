# Authentication

The application uses Supabase Auth for user authentication.

## Supported Methods
1.  **Google OAuth**: Enabled via `signInWithOAuth`. Requires Google Cloud Console setup.
2.  **Email/Password**: Enabled via `signUp` and `signInWithPassword`.

## Key Components
- **`app/login/page.tsx`**: The main entry point for authentication.
- **`components/auth/auth-form.tsx`**: Handles the form logic for both OAuth and Email auth.
- **`lib/supabase/session.ts`**: Protects routes under `/dashboard`.
- **`app/dashboard/account/page.tsx`**: Allows users to manage their account (sign out, delete).

## Configuration
Ensure your `.env.local` has:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (For admin operations like deletion)
- `NEXT_PUBLIC_SITE_URL` (Optional, defaults to `location.origin`. Set to your production domain, e.g., `https://palettepics.com`)

## Custom Domain Setup

When using a custom domain (e.g., `palettepics.com`), you need to configure OAuth redirect URLs and optionally set up a custom domain in Supabase to show your domain in the Google OAuth consent screen.

### 1. Configure Supabase Custom Domain (To Fix OAuth Consent Screen)

**Problem:** By default, Google's OAuth consent screen shows your Supabase project domain (`wrohxwrpkgghjmwliyxx.supabase.co`) instead of your custom domain.

**Solution:** Configure a custom domain in Supabase so Google shows `palettepics.com` in the consent screen.

1. Go to your Supabase project → **Settings** → **Custom Domains**
2. Add your custom domain (`palettepics.com`)
3. Follow Supabase's DNS configuration instructions to point your domain to Supabase
4. Once verified, update your `NEXT_PUBLIC_SUPABASE_URL` environment variable to use the custom domain instead of the `.supabase.co` URL

**Note:** This requires DNS configuration and may take time to propagate. See [Supabase Custom Domains documentation](https://supabase.com/docs/guides/platform/custom-domains) for details.

**Alternative (if custom domain not configured):** Google will show `wrohxwrpkgghjmwliyxx.supabase.co` in the consent screen, but authentication will still work correctly.

### 2. Supabase Dashboard - URL Configuration

1. Go to your Supabase project → **Authentication** → **URL Configuration**
2. Add your custom domain to **Redirect URLs**:
   - `https://palettepics.com/auth/callback`
   - `https://www.palettepics.com/auth/callback` (if using www)
   - `http://localhost:3000/auth/callback` (for local development)
3. Set **Site URL** to:
   - `https://palettepics.com` (production)
   - `http://localhost:3000` (development)

### 3. Google Cloud Console

**Important:** When using Supabase Auth, Google redirects to Supabase first, then Supabase redirects to your app. You need to configure Supabase's redirect URI in Google Cloud Console.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - **If using custom domain:** `https://palettepics.com/auth/v1/callback`
   - **If NOT using custom domain:** `https://wrohxwrpkgghjmwliyxx.supabase.co/auth/v1/callback` (replace with your project ref)
   - **For localhost testing:** Use a tunnel service (like ngrok) or test on your production domain
5. Under **Authorized JavaScript origins**, add:
   - `https://palettepics.com` (production)
   - Your Supabase custom domain if configured
6. Save the changes

### 4. Environment Variables

Make sure to set `NEXT_PUBLIC_SITE_URL=https://palettepics.com` in your production environment variables (Vercel, etc.). This tells Supabase where to redirect users after authentication.

**For localhost:** Don't set `NEXT_PUBLIC_SITE_URL` in development - the code will automatically use `location.origin` (which will be `http://localhost:3000`).

## User Profile Sync
A Postgres trigger (`handle_new_user`) automatically creates a `public.profiles` row whenever a new user is created in `auth.users`. This ensures we always have a profile to attach credits and other data to.

