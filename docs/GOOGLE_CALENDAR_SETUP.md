# Google Calendar Integration Setup

This guide walks you through configuring Google OAuth with Calendar access for Morning Focus.

---

## Part 1: Google Cloud Console

### 1. Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **New Project** (or select an existing one)
3. Name it e.g. "Morning Focus" → **Create**

### 2. Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search for **Google Calendar API**
3. Click it → **Enable**

### 3. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External** (for any Google account)
   - App name: **Morning Focus**
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `https://www.googleapis.com/auth/calendar.readonly`
   - Save

4. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: e.g. "Morning Focus Web"
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:3001`
     - Your production URL (e.g. `https://your-app.vercel.app`)
   - **Authorized redirect URIs**:
     - Copy from Supabase (see Part 2 below) — typically:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Click **Create**

5. **Copy the Client ID and Client Secret** — you'll need these for Supabase.

---

## Part 2: Supabase Dashboard

### 1. Configure Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. **Authentication** → **Providers** → **Google**
4. Enable **Google**
5. Paste your **Client ID** and **Client Secret** from Google Cloud Console
6. **Copy the "Callback URL (for OAuth)"** — paste this into Google Cloud Console as an Authorized redirect URI (if you haven't already)
7. Save

### 2. (Optional) Additional Scopes in Supabase

Supabase's Google provider uses standard scopes (email, profile). Our app requests `calendar.readonly` when the user clicks "Continue with Google" — no extra Supabase config needed. The scope is passed in the OAuth request from our code.

---

## Part 3: Verify Setup

1. Sign out of Morning Focus if logged in
2. Go to `/login` and click **Continue with Google**
3. On the Google consent screen, you should see a request for **View your calendar events**
4. After signing in, the Battle Plan section will show your real Google Calendar events for today

---

## Troubleshooting

- **"Access blocked" or "invalid scope"** → Ensure Google Calendar API is enabled and the scope is added to your OAuth consent screen
- **"Redirect URI mismatch"** → The redirect URI in Google Cloud must exactly match Supabase's callback URL
- **No events showing** → Ensure you signed in with Google (not email/password). Calendar access requires Google OAuth.
- **Token expired** → Sign out and sign in again with Google to refresh the token
