# Deploy the ASTRUM Portal — No-Code-Friendly Guide

This package is designed for **Vercel + Supabase**:

- **Vercel** hosts the website.
- **Supabase** provides individual logins, the database, roles, and progress tracking.

You do not need to write code. You will create two accounts, copy/paste one SQL setup file, upload this project to GitHub, and connect GitHub to Vercel.

---

## Part 1 — Create the Supabase database and login system

### 1. Create a Supabase account/project
Go to:
https://supabase.com/dashboard

Sign in and choose **New project**. Name it something like `astrum-portal`.

Official Supabase Next.js quickstart:
https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

### 2. Create the ASTRUM tables and load the full source library
Inside your Supabase project:

1. Click **SQL Editor** in the left menu.
2. Click **New query**.
3. On your computer, open this file from the package:
   `supabase/setup_all.sql`
4. Select all of the text in that file and copy it.
5. Paste it into the Supabase SQL Editor.
6. Click **Run**.

That one operation creates:
- profiles and roles
- all 60 ASTRUM source records
- source completion tracking
- weekly work plans
- work diary entries
- mentor/student relationships
- database Row Level Security policies

### 3. Get your two Supabase connection values
In Supabase, open your project and use **Connect** / API settings to find:

- Project URL
- Publishable key

Supabase's current documentation calls these:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do **not** put a service-role key into the website.

Keep the two values handy for Vercel.

---

## Part 2 — Put the website files in GitHub

Vercel works best when the project is connected to a Git repository. The browser route requires no command line.

### 4. Create a GitHub account/repository
Go to:
https://github.com/new

Create a repository named something like:
`astrum-portal`

A **private repository** is fine and is recommended for this project.

### 5. Upload this project folder through the browser
After creating the repository:

1. Click **Add file**.
2. Choose **Upload files**.
3. Drag the **contents of the `astrum-portal` folder** into the upload window.
4. Do **not** upload any `.env` file containing keys.
5. Commit the upload to the `main` branch.

GitHub's official browser-upload instructions:
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

---

## Part 3 — Deploy on Vercel

### 6. Import the GitHub project into Vercel
Go to:
https://vercel.com/new

1. Sign in to Vercel.
2. Connect GitHub if asked.
3. Find the `astrum-portal` repository.
4. Click **Import**.
5. Vercel should automatically recognize the project as **Next.js**.

Official Vercel Git deployment documentation:
https://vercel.com/docs/git

### 7. Add the Supabase environment variables BEFORE final production use
In the Vercel project, open:

**Settings → Environment Variables**

Add these three variables:

`NEXT_PUBLIC_SUPABASE_URL`
Value: your Supabase Project URL

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
Value: your Supabase Publishable key

`NEXT_PUBLIC_DEMO_MODE`
Value: `false`

Apply them to Production, Preview, and Development unless you have a reason not to.

Official Vercel environment-variable guide:
https://vercel.com/docs/environment-variables/managing-environment-variables

### 8. Deploy / redeploy
Click **Deploy**. If you added environment variables after the first deployment, choose **Redeploy** so the new values are included.

Vercel gives you a live `*.vercel.app` address.

---

## Part 4 — Create faculty and student accounts

### 9. Add users in Supabase
In Supabase, go to the Authentication user-management area and create/invite the users you want to access ASTRUM.

Supabase user-management reference:
https://supabase.com/docs/guides/auth/managing-user-data

The supplied database trigger automatically creates a matching row in the `profiles` table after a new Auth user is created.

### 10. Make your account an administrator
In Supabase:

1. Open **Table Editor**.
2. Open the `profiles` table.
3. Find your row by email address.
4. Change `role` from `student` to `admin`.

For a faculty mentor, change `role` to `mentor`.

For a student, leave `role` as `student`.

### 11. Assign students to mentors
In the `profiles` table:

1. Locate the mentor row and note its `id`.
2. Locate the student row.
3. Put the mentor's `id` into the student's `mentor_id` field.

The database security policies then allow that mentor to see the assigned student's learning records while preventing unrelated mentors from seeing them.

---

## Part 5 — Test the portal

Visit your Vercel URL and test all of these:

1. Student can sign in.
2. Student can open the ASTRUM Archive.
3. Student can mark a source **In Progress** and **Completed**.
4. Student can create a Weekly Work Plan.
5. Student can log Work Diary hours.
6. Dashboard converts logged hours into Elton units at **25 hours = 1 unit**.
7. Mentor can sign in and see only assigned students.
8. Administrator can see the full cohort.
9. The official-source link opens correctly for your most important Phase II sources.

---

## Part 6 — Give it an ASTRUM web address

After the site is working, choose a subdomain on a domain you already control, for example:

`astrum.your-university-domain.edu`

In Vercel:

**Project → Settings → Domains → Add Domain**

Vercel will tell you exactly which DNS record to add at your domain registrar.

Official custom-domain guide:
https://vercel.com/docs/domains/set-up-custom-domain

---

# What the MVP already includes

- Private individual login
- Student / Mentor / Admin roles
- Dark ASTRUM visual identity
- Mission Dashboard
- ASTRUM Archive
- Full 60-source database seed
- 10 Phase II core modules highlighted
- ASTRUM Briefs
- Raven's Lens
- Commander's Questions
- Audio-briefing scripts
- Visual concepts
- AEGIS ORBIT links
- Research vectors
- Reading-progress tracking
- Weekly work plans
- Work diary
- Engagement-hour tracking
- Automatic 25-hours-per-unit calculation
- Mentor cohort view
- Database Row Level Security

# Recommended Phase IV additions after launch

1. File upload / evidence portfolio (or deeper Elton Dash linkage)
2. Mentor comments on individual weekly plans
3. Interactive AEGIS ORBIT scenario release and response engine
4. RAVEN semantic search across the archive
5. Finished narrated audio files and visual explainers
6. Student competency record / portfolio transcript
7. Faculty content-management screen for editing ASTRUM assets without SQL
8. Email notifications for new assignments and mentor feedback
9. MFA for privileged accounts
10. Analytics for reading, completion, workload, and curriculum effectiveness

# Important security boundary

Use this MVP only for **unclassified educational material and normal student records**. Do not upload classified material, CUI, ITAR-controlled technical data, operational secrets, or restricted government information until a separate compliant architecture is designed and approved.
