# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

There is no test suite.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `ANTHROPIC_API_KEY` — Anthropic API key for AI text generation (job posts & resumes)

## Architecture

This is a Korean-language yoga instructor job board (요가 구인구직 플랫폼) built with Next.js App Router, Tailwind CSS v4, and Supabase as the backend.

### Key patterns

**All pages are client components** (`'use client'`). There are no server components in the `app/` directory pages. Auth checks happen in `useEffect` via `supabase.auth.getUser()`.

**Auth guard pattern** used on protected pages:
```js
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  sessionStorage.setItem('loginRequired', 'true');
  router.push('/login?redirect=<page-name>');
  return;
}
```

**Admin check** — after verifying auth, query `profiles` table for `role === 'admin'`.

**Path alias**: `@/` maps to the project root (e.g., `@/lib/supabase`).

### Supabase database tables

| Table | Purpose |
|---|---|
| `job` | Job listings — fields: `title`, `location`, `yoga_style`, `experience`, `salary`, `description`, `user_id`, `status`, `expires_at`, `closed_at` |
| `candidate` | Resume/instructor profiles — fields: `name`, `location`, `yoga_styles`, `experience_years`, `user_id`, `status`, `expires_at`, `closed_at` |
| `profiles` | User profiles — fields: `id`, `email`, `role` (`'user'` or `'admin'`) |
| `applications` | Dual-purpose table for both job applications (`job_id` set) and resume contacts (`candidate_id` set) |
| `bookmarks` | Saved items — `job_id` or `candidate_id` with `user_id` |
| `notifications` | In-app notifications — `type` is `'application'` or `'contact'` |
| `property` | Yoga space listings — fields: `title`, `property_type` (`임대`/`매매`/`양도`), `location`, `area`, `price`, `description`, `contact`, `user_id`, `status` |
| `community_posts` | Community board posts — fields: `title`, `content`, `category`, `user_id`, `author_email`, `views` |
| `community_comments` | Comments on community posts — fields: `post_id`, `user_id`, `author_email`, `content` |

### Lib utilities

- `lib/supabase.js` — exports the shared Supabase client singleton
- `lib/expiry.js` — `closeJob`, `reopenJob`, `extendJobExpiry`, `closeResume`, `reopenResume`, `extendResumeExpiry`, `getDaysUntilExpiry`, `getStatusBadge` — all listings expire after 30 days and can be managed from mypage
- `lib/notifications.js` — `createApplicationNotification`, `createContactNotification`

### AI generation

- `app/api/generate-job-post/route.js` — POST endpoint using Claude API (`claude-opus-4-8`) to generate Korean yoga job post descriptions. Accepts `{location, yogaStyle, experience, salary}`. Requires `ANTHROPIC_API_KEY`.
- `app/api/generate-resume/route.js` — POST endpoint using Claude API (`claude-opus-4-8`) to generate Korean yoga instructor self-introductions. Accepts `{name, location, yogaStyles, experienceYears, certifications}`. Requires `ANTHROPIC_API_KEY`.

### Deployment

Deployed on Vercel. `vercel.json` defines a cron job at `GET /api/cron/seed` running every 6 hours.
