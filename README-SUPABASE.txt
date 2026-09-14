KARMA LABS — SUPABASE CONNECTED VERSION

FLOW
Website form
  -> Vercel /api/contact
  -> Supabase public.leads (main storage)
  -> Formspree (email/submission notification)

REQUIRED VERCEL ENVIRONMENT VARIABLES
SUPABASE_URL
SUPABASE_SECRET_KEY

IMPORTANT
- SUPABASE_SECRET_KEY must stay in Vercel only.
- Never paste the secret key into index.html or script.js.
- No new database columns are required.
- Quora Service is stored in the existing `industry` column.
- Primary Goal is stored in the existing `main_goal` column.
- Other fields use name, email, website, message, status, and source.

EXPECTED SUPABASE TABLE
public.leads with:
id
created_at
name
email
website
industry
main_goal
message
status
source
utm_source
utm_campaign

UPLOAD
Replace/upload all files in this ZIP to the root of the GitHub repository,
commit the changes, then let Vercel redeploy.
