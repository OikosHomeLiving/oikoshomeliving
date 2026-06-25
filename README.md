# OIKΩs · Home Living — Website Files

## Αρχεία

| Αρχείο | Περιγραφή |
|--------|-----------|
| `index.html` | Κύριο site (booking, gallery, reviews, location) |
| `admin.html` | Admin panel (login, κρατήσεις, ημερολόγιο, στατιστικά) |
| `supabase-schema.sql` | SQL για το Supabase database |
| `logo.png` | Logo χωρίς background, χωρίς "HOME LIVING" |

## Setup Supabase

1. Πήγαινε στο **supabase.com** → νέο project
2. **SQL Editor** → paste το `supabase-schema.sql` → Run
3. **Authentication → Users** → Invite → email του admin
4. Αντικατέστησε στα 2 HTML αρχεία:
   - `YOUR_PROJECT` → το Supabase project URL
   - `YOUR_ANON_KEY` → το anon key (Settings → API)

## Demo Admin Panel

Άνοιξε το `admin.html` και σύνδεσε με:
- Email: `demo@oikos.gr`
- Password: `demo1234`

## Keep-Alive (cron-job.org)

Για να μην κοιμάται η Supabase βάση:
1. cron-job.org → νέο job
2. URL: `https://YOUR_PROJECT.supabase.co/rest/v1/settings?select=key`
3. Header: `apikey: YOUR_ANON_KEY`
4. Schedule: κάθε 5 μέρες

## Palette & Fonts

- **Linen** `#EDE8E1` · **Ink** `#1A1917` · **Gold** `#B8965A`
- Playfair Display · Inter · DM Mono
