# ASTRUM Portal Security & Privacy Notes

This MVP is intended for **unclassified educational content and ordinary student learning records**.

## Do not put these into the MVP
- Classified information of any level.
- Controlled Unclassified Information (CUI) unless the hosting, identity, logging, contractual, and compliance environment has been deliberately upgraded for the applicable requirements.
- Export-controlled technical data, ITAR/EAR-restricted material, or proprietary partner data unless ADAM/Elton legal and security leadership has approved the environment.
- Government credentials, operational mission secrets, passwords, private keys, or other regulated secrets.

## Security model included in the MVP
- Individual Supabase Auth accounts (email/password).
- Student, mentor, and administrator roles.
- Row Level Security (RLS) in PostgreSQL.
- Students can write their own progress and diary entries.
- Mentors can read only students assigned to them.
- Administrators can read the full cohort and manage source content.
- Vercel environment variables keep deployment configuration out of source control.

## Before broader institutional use
1. Enable MFA for faculty/admin accounts if available in your chosen authentication plan.
2. Review retention, backup, export, and deletion policies for student records.
3. Add an institutional privacy notice and acceptable-use policy.
4. Decide whether students may upload files or only link to Elton Dash.
5. If regulated government data ever enters the system, conduct a separate architecture/compliance review rather than assuming this MVP is sufficient.
